package com.ztf.zma.payment.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ztf.zma.payment.domain.Payment;
import com.ztf.zma.payment.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

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
    private final ObjectMapper objectMapper;

    @Value("${cinetpay.webhook.secret}")
    private String webhookSecret;

    public PaymentController(PaymentService paymentService, ObjectMapper objectMapper) {
        this.paymentService = paymentService;
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
                auth.getName(), request.courseId(), request.promoCode());
            return ResponseEntity.status(HttpStatus.CREATED).body(payment);
        } catch (PaymentService.AlreadyPaidException ex) {
            return ResponseEntity.ok(ex.getPayment());
        }
    }

    /** Manual confirm (dev/simulation) or called by webhook handler */
    @PatchMapping("/{id}/confirm")
    public Payment confirm(@PathVariable String id) {
        return paymentService.confirmPayment(id);
    }

    @PatchMapping("/{id}/fail")
    public Payment fail(@PathVariable String id) {
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
}
