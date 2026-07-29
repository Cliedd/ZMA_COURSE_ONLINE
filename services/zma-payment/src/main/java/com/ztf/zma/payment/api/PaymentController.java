package com.ztf.zma.payment.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.stripe.exception.SignatureVerificationException;
import com.stripe.model.Event;
import com.stripe.net.Webhook;
import com.ztf.zma.payment.domain.Payment;
import com.ztf.zma.payment.service.InvoicePdfService;
import com.ztf.zma.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService paymentService;
    private final InvoicePdfService invoicePdfService;
    private final ObjectMapper objectMapper;

    @Value("${cinetpay.webhook.secret}")
    private String webhookSecret;

    @Value("${stripe.webhook-secret:}")
    private String stripeWebhookSecret;

    public PaymentController(PaymentService paymentService, InvoicePdfService invoicePdfService, ObjectMapper objectMapper) {
        this.paymentService = paymentService;
        this.invoicePdfService = invoicePdfService;
        this.objectMapper = objectMapper;
    }

    /**
     * Initiates checkout — price is fetched from zma-catalog, not from client.
     * Returns the payment with checkoutUrl for redirect.
     */
    @Operation(summary = "Start checkout", description = "Creates a payment for the authenticated student; price is authoritative from the catalog service")
    @PostMapping("/checkout")
    @ResponseStatus(HttpStatus.CREATED)
    public ResponseEntity<Payment> checkout(@Valid @RequestBody CheckoutRequest request,
                                            Authentication auth) {
        try {
            Payment payment = paymentService.initiateCheckout(
                auth.getName(), request.courseId(), request.promoCode(), request.provider());
            return ResponseEntity.status(HttpStatus.CREATED).body(payment);
        } catch (PaymentService.AlreadyPaidException ex) {
            return ResponseEntity.ok(ex.getPayment());
        }
    }

    /**
     * ADMIN-only manual override (e.g. a support case where a gateway webhook
     * genuinely never arrived and payment was verified out-of-band). NOT for
     * general use: a payment moving to SUCCESS must otherwise only ever come
     * from a signature-verified gateway webhook — allowing any authenticated
     * user to call this would let a student mark their own pending payment
     * SUCCESS for free.
     */
    @Operation(summary = "Manually confirm a payment", description = "Requires ROLE_ADMIN — normal confirmation is webhook-driven only")
    @PatchMapping("/{id}/confirm")
    public Payment confirm(@PathVariable String id, Authentication auth) {
        requireAdmin(auth);
        return paymentService.confirmPayment(id);
    }

    @Operation(summary = "Manually fail a payment", description = "Requires ROLE_ADMIN")
    @PatchMapping("/{id}/fail")
    public Payment fail(@PathVariable String id, Authentication auth) {
        requireAdmin(auth);
        return paymentService.failPayment(id);
    }

    /** ADMIN only — refund a payment */
    @Operation(summary = "Refund a payment", description = "Requires ROLE_ADMIN")
    @PostMapping("/{id}/refund")
    public Payment refund(@PathVariable String id, Authentication auth) {
        String role = getRole(auth);
        if (!"ADMIN".equals(role)) {
            throw new RuntimeException("Access denied: ADMIN role required");
        }
        return paymentService.refundPayment(id);
    }

    @GetMapping("/{id}")
    public Payment getById(@PathVariable String id) {
        return paymentService.getById(id);
    }

    /** PDF receipt — the paying student or an ADMIN only, and only once the payment succeeded. */
    @Operation(summary = "Download invoice PDF", description = "Owning student or ADMIN only; payment must be SUCCESS")
    @GetMapping("/{id}/invoice/pdf")
    public ResponseEntity<byte[]> invoicePdf(@PathVariable String id, Authentication auth) {
        Payment payment = paymentService.getById(id);
        boolean isOwner = payment.getStudentId().equals(auth.getName());
        if (!isOwner && !"ADMIN".equals(getRole(auth))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your payment");
        }
        if (!"SUCCESS".equals(payment.getStatus())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Invoice only available for successful payments");
        }
        byte[] pdf = invoicePdfService.generate(payment);
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"invoice-" + payment.getId() + ".pdf\"")
                .body(pdf);
    }

    /** Current user's payment history */
    @GetMapping("/me")
    public List<Payment> getMyPayments(Authentication auth) {
        return paymentService.getByStudent(auth.getName());
    }

    /** Check if current user has paid for a course */
    @Operation(summary = "Check payment status", description = "Whether the current user has a SUCCESS payment for the given course")
    @GetMapping("/check")
    public Map<String, Boolean> checkPayment(@RequestParam String courseId,
                                              Authentication auth) {
        return Map.of("paid", paymentService.hasPaid(auth.getName(), courseId));
    }

    // ── CinetPay Webhook ──────────────────────────────────────────────────────

    /**
     * CinetPay sends a POST to this endpoint when a payment is confirmed.
     * The request contains cpm_trans_id (transaction ID) and cpm_result ("00" = success).
     *
     * This endpoint is public (no JWT) — instead it is secured with an HMAC-SHA256
     * signature computed over the raw request body using the shared
     * {@code cinetpay.webhook.secret}. The signature must be supplied in the
     * "x-token" header, hex-encoded. Requests with a missing or invalid signature
     * are rejected with 403 before any payment is touched.
     */
    @Operation(summary = "CinetPay payment webhook", description = "HMAC-SHA256 signed callback from CinetPay confirming a payment")
    @PostMapping("/webhook/cinetpay")
    public ResponseEntity<String> cinetpayWebhook(HttpServletRequest req,
                                                   @RequestHeader(value = "x-token", required = false) String signature,
                                                   @RequestBody(required = false) String rawBody) {
        if (rawBody == null || rawBody.isBlank()) {
            return ResponseEntity.badRequest().body("Empty body");
        }

        if (!isValidSignature(rawBody, signature)) {
            log.warn("CinetPay webhook: rejected — missing or invalid HMAC signature");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid signature");
        }

        Map<String, Object> body;
        try {
            body = objectMapper.readValue(rawBody, Map.class);
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body("Invalid JSON body");
        }

        String transactionId = (String) body.get("cpm_trans_id");
        String result        = (String) body.get("cpm_result");

        log.info("CinetPay webhook received: transactionId={} result={}", transactionId, result);

        if (transactionId == null) {
            return ResponseEntity.badRequest().body("Missing cpm_trans_id");
        }

        if ("00".equals(result)) {
            try {
                paymentService.confirmByTransactionId(transactionId);
                return ResponseEntity.ok("Payment confirmed");
            } catch (Exception ex) {
                log.error("Webhook confirm failed for {}: {}", transactionId, ex.getMessage());
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Confirm failed: " + ex.getMessage());
            }
        } else {
            log.warn("CinetPay webhook: non-success result={} for txn={}", result, transactionId);
            return ResponseEntity.ok("Payment not successful — ignoring");
        }
    }

    /**
     * Computes HMAC-SHA256 over the raw request body with the configured shared
     * secret and compares it (constant-time) to the signature supplied by CinetPay.
     */
    private boolean isValidSignature(String rawBody, String signature) {
        if (signature == null || signature.isBlank()) {
            return false;
        }
        if (webhookSecret == null || webhookSecret.isBlank()) {
            log.error("cinetpay.webhook.secret is not configured — refusing webhook");
            return false;
        }
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(webhookSecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] hash = mac.doFinal(rawBody.getBytes(StandardCharsets.UTF_8));
            String computed = HexFormat.of().formatHex(hash);
            return MessageDigest.isEqual(
                computed.getBytes(StandardCharsets.UTF_8),
                signature.trim().toLowerCase().getBytes(StandardCharsets.UTF_8));
        } catch (Exception ex) {
            log.error("Error computing webhook signature: {}", ex.getMessage());
            return false;
        }
    }

    private String getRole(Authentication auth) {
        return auth.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .filter(a -> a.startsWith("ROLE_"))
            .map(a -> a.substring(5))
            .findFirst().orElse("STUDENT");
    }

    private void requireAdmin(Authentication auth) {
        if (!"ADMIN".equals(getRole(auth))) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "ADMIN role required");
        }
    }

    // ── Stripe Webhook ───────────────────────────────────────────────────────

    /**
     * Stripe sends a POST here on checkout events. The Stripe SDK verifies the
     * "Stripe-Signature" header itself (Webhook.constructEvent) using the
     * shared {@code stripe.webhook-secret} — requests with a missing or
     * invalid signature are rejected with 400 before any payment is touched.
     * Only checkout.session.completed actually confirms a payment; every
     * other event type is acknowledged (200) and ignored.
     */
    @Operation(summary = "Stripe payment webhook", description = "Signature-verified callback from Stripe confirming a checkout session")
    @PostMapping("/webhook/stripe")
    public ResponseEntity<String> stripeWebhook(
            @RequestHeader(value = "Stripe-Signature", required = false) String signatureHeader,
            @RequestBody(required = false) String rawBody) {
        if (rawBody == null || rawBody.isBlank()) {
            return ResponseEntity.badRequest().body("Empty body");
        }
        if (signatureHeader == null || signatureHeader.isBlank()) {
            log.warn("Stripe webhook: rejected — missing Stripe-Signature header");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Missing signature");
        }
        if (stripeWebhookSecret == null || stripeWebhookSecret.isBlank()) {
            log.error("stripe.webhook-secret is not configured — refusing webhook");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Webhook not configured");
        }

        Event event;
        try {
            event = Webhook.constructEvent(rawBody, signatureHeader, stripeWebhookSecret);
        } catch (SignatureVerificationException ex) {
            log.warn("Stripe webhook: rejected — invalid signature");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("Invalid signature");
        } catch (Exception ex) {
            return ResponseEntity.badRequest().body("Invalid payload");
        }

        if (!"checkout.session.completed".equals(event.getType())) {
            return ResponseEntity.ok("Ignored event type: " + event.getType());
        }

        // Signature is already verified above via the real Stripe SDK — reading
        // fields back out of the same verified rawBody with plain JSON parsing
        // (rather than the SDK's typed data.object deserialization, which
        // requires matching Stripe's internal API-version-specific schema
        // exactly and is brittle across SDK/API versions) doesn't weaken
        // security at all: the bytes were already proven untampered.
        String paymentId;
        String paymentStatus;
        String sessionId;
        try {
            Map<String, Object> root = objectMapper.readValue(rawBody, Map.class);
            Map<String, Object> data = (Map<String, Object>) root.get("data");
            Map<String, Object> session = data != null ? (Map<String, Object>) data.get("object") : null;
            paymentId = session != null ? (String) session.get("client_reference_id") : null;
            paymentStatus = session != null ? (String) session.get("payment_status") : null;
            sessionId = session != null ? (String) session.get("id") : null;
        } catch (Exception ex) {
            log.error("Stripe webhook: could not parse checkout.session.completed payload: {}", ex.getMessage());
            return ResponseEntity.badRequest().body("Could not read session");
        }

        if (paymentId == null || paymentId.isBlank()) {
            log.error("Stripe webhook: session {} has no client_reference_id", sessionId);
            return ResponseEntity.badRequest().body("Missing client_reference_id");
        }

        if (!"paid".equals(paymentStatus)) {
            log.warn("Stripe webhook: session {} completed but payment_status={} — not confirming",
                    sessionId, paymentStatus);
            return ResponseEntity.ok("Payment not settled — ignoring");
        }

        try {
            paymentService.confirmByIdIdempotent(paymentId);
            return ResponseEntity.ok("Payment confirmed");
        } catch (Exception ex) {
            log.error("Stripe webhook confirm failed for payment {}: {}", paymentId, ex.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Confirm failed: " + ex.getMessage());
        }
    }
}
