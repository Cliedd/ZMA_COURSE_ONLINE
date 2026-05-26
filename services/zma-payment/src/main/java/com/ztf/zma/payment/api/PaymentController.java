package com.ztf.zma.payment.api;

import com.ztf.zma.payment.domain.Payment;
import com.ztf.zma.payment.service.PaymentService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/payments")
public class PaymentController {

    private static final Logger log = LoggerFactory.getLogger(PaymentController.class);

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    /**
     * Initiates checkout — price is fetched from zma-catalog, not from client.
     * Returns the payment with checkoutUrl for redirect.
     */
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
     * This endpoint is public (no JWT) — secured at the network level.
     * In production add HMAC signature verification.
     */
    @PostMapping("/webhook/cinetpay")
    public ResponseEntity<String> cinetpayWebhook(HttpServletRequest req,
                                                   @RequestBody(required = false) Map<String, Object> body) {
        if (body == null) {
            return ResponseEntity.badRequest().body("Empty body");
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

    private String getRole(Authentication auth) {
        return auth.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .filter(a -> a.startsWith("ROLE_"))
            .map(a -> a.substring(5))
            .findFirst().orElse("STUDENT");
    }
}
