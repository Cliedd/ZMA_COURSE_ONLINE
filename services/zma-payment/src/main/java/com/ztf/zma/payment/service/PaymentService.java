package com.ztf.zma.payment.service;

import com.ztf.zma.payment.domain.Payment;
import com.ztf.zma.payment.domain.PaymentProvider;
import com.ztf.zma.payment.infrastructure.CatalogClient;
import com.ztf.zma.payment.infrastructure.CinetPayClient;
import com.ztf.zma.payment.infrastructure.CommunityNotificationClient;
import com.ztf.zma.payment.infrastructure.EnrollmentClient;
import com.ztf.zma.payment.infrastructure.StripeClient;
import com.ztf.zma.payment.repository.PaymentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class PaymentService {

    private static final Logger log = LoggerFactory.getLogger(PaymentService.class);

    private final PaymentRepository  paymentRepository;
    private final EnrollmentClient   enrollmentClient;
    private final CatalogClient      catalogClient;
    private final CommunityNotificationClient communityNotificationClient;
    private final StripeClient       stripeClient;
    private final CinetPayClient     cinetPayClient;

    public PaymentService(PaymentRepository paymentRepository,
                          EnrollmentClient enrollmentClient,
                          CatalogClient catalogClient,
                          CommunityNotificationClient communityNotificationClient,
                          StripeClient stripeClient,
                          CinetPayClient cinetPayClient) {
        this.paymentRepository = paymentRepository;
        this.enrollmentClient  = enrollmentClient;
        this.catalogClient     = catalogClient;
        this.communityNotificationClient = communityNotificationClient;
        this.stripeClient      = stripeClient;
        this.cinetPayClient    = cinetPayClient;
    }

    /**
     * Initiates a checkout. Free courses enroll directly, no gateway involved.
     * Paid courses are routed to a real gateway (Stripe Checkout for
     * card/PayPal, CinetPay for mobile money) — the returned Payment's
     * checkoutUrl is the actual hosted payment page the browser must be
     * redirected to. Nothing is marked SUCCESS here: that only ever happens
     * from a signature-verified webhook (see PaymentController), never from
     * the checkout call itself or anything the browser reports back.
     */
    @Transactional
    public Payment initiateCheckout(String studentId, String courseId, String promoCode, PaymentProvider provider) {
        // Idempotent: return existing pending or successful payment
        paymentRepository.findByStudentIdAndCourseIdAndStatus(studentId, courseId, "SUCCESS")
            .ifPresent(p -> { throw new AlreadyPaidException(p); });

        // Fetch authoritative price from catalog — never trust a client-supplied amount
        Map<String, Object> courseInfo = catalogClient.getCourseInfo(courseId);
        double amount  = 0.0;
        String title   = "";
        String level   = "";
        String teacherEmail = null;
        String currency = "XAF";

        if (courseInfo != null) {
            amount  = courseInfo.get("price")    != null ? ((Number) courseInfo.get("price")).doubleValue() : 0.0;
            title   = courseInfo.getOrDefault("title", "").toString();
            level   = courseInfo.getOrDefault("level", "").toString();
            Object te = courseInfo.get("teacherEmail");
            teacherEmail = (te != null && !te.toString().isBlank()) ? te.toString() : null;
        }

        // Free course → enroll directly, skip payment gateway entirely
        if (amount <= 0) {
            Payment free = new Payment();
            free.setStudentId(studentId);
            free.setCourseId(courseId);
            free.setCourseTitle(title);
            free.setTeacherEmail(teacherEmail);
            free.setAmount(0.0);
            free.setCurrency(currency);
            free.setStatus("SUCCESS");
            free.setProvider("FREE");
            free.setConfirmedAt(Instant.now());
            free.setPromoCode(promoCode);
            Payment saved = paymentRepository.save(free);
            enrollmentClient.enroll(studentId, courseId, title, level);
            return saved;
        }

        if (provider == null) {
            throw new IllegalArgumentException("A payment provider is required for a paid course");
        }

        // Generated up front so it can be handed to the gateway as our own
        // reference (client_reference_id for Stripe, transaction_id for
        // CinetPay) BEFORE the row is persisted — a failed gateway call
        // throws here and nothing is written, rather than leaving a PENDING
        // row with no real checkout URL behind it.
        String paymentId = UUID.randomUUID().toString();
        String gatewayTransactionId;
        String checkoutUrl;

        if (provider == PaymentProvider.CINETPAY) {
            CinetPayClient.CheckoutResult result = cinetPayClient.initiatePayment(paymentId, amount, title);
            gatewayTransactionId = paymentId; // CinetPay echoes this back as cpm_trans_id on the webhook
            checkoutUrl = result.checkoutUrl();
        } else {
            StripeClient.CheckoutSession session = stripeClient.createCheckoutSession(
                    paymentId, provider, amount, currency, title);
            gatewayTransactionId = session.sessionId();
            checkoutUrl = session.checkoutUrl();
        }

        Payment payment = new Payment();
        payment.setId(paymentId);
        payment.setStudentId(studentId);
        payment.setCourseId(courseId);
        payment.setCourseTitle(title);
        payment.setTeacherEmail(teacherEmail);
        payment.setAmount(amount);
        payment.setCurrency(currency);
        payment.setStatus("PENDING");
        payment.setProvider(provider.name());
        payment.setPromoCode(promoCode);
        payment.setTransactionId(gatewayTransactionId);
        payment.setCheckoutUrl(checkoutUrl);
        return paymentRepository.save(payment);
    }

    /**
     * Confirms a pending payment (called by webhook or manually in dev).
     * Sets status to SUCCESS and triggers enrollment.
     */
    @Transactional
    public Payment confirmPayment(String paymentId) {
        Payment payment = getById(paymentId);
        if (!"PENDING".equals(payment.getStatus())) {
            throw new RuntimeException("Payment is not in PENDING state");
        }
        payment.setStatus("SUCCESS");
        payment.setConfirmedAt(Instant.now());
        Payment saved = paymentRepository.save(payment);
        enrollmentClient.enroll(saved.getStudentId(), saved.getCourseId(),
                                saved.getCourseTitle(), null);
        // Best-effort — must never break payment confirmation (see CommunityNotificationClientImpl).
        communityNotificationClient.notifyPaymentConfirmed(saved.getStudentId(), saved.getCourseTitle());
        return saved;
    }

    /**
     * Confirms payment by gateway transaction ID (CinetPay webhook path).
     * Delegates to confirmPayment (idempotent check above prevents double-notification).
     */
    @Transactional
    public Payment confirmByTransactionId(String transactionId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
            .orElseThrow(() -> new RuntimeException("Payment not found for transaction: " + transactionId));
        if ("SUCCESS".equals(payment.getStatus())) return payment; // idempotent
        return confirmPayment(payment.getId());
    }

    /**
     * Confirms by our own Payment.id (Stripe webhook path — client_reference_id
     * on the Checkout Session IS our Payment.id). Idempotent: Stripe retries
     * webhook delivery, and a duplicate checkout.session.completed for an
     * already-SUCCESS payment must be a silent no-op, not an error.
     */
    @Transactional
    public Payment confirmByIdIdempotent(String paymentId) {
        Payment payment = getById(paymentId);
        if ("SUCCESS".equals(payment.getStatus())) return payment;
        return confirmPayment(paymentId);
    }

    @Transactional
    public Payment failPayment(String paymentId) {
        Payment payment = getById(paymentId);
        payment.setStatus("FAILED");
        return paymentRepository.save(payment);
    }

    /** ADMIN only — mark payment as refunded */
    @Transactional
    public Payment refundPayment(String paymentId) {
        Payment payment = getById(paymentId);
        if (!"SUCCESS".equals(payment.getStatus())) {
            throw new RuntimeException("Only successful payments can be refunded");
        }
        payment.setStatus("REFUNDED");
        return paymentRepository.save(payment);
    }

    public Payment getById(String id) {
        return paymentRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    public List<Payment> getByStudent(String studentId) {
        return paymentRepository.findByStudentId(studentId);
    }

    public boolean hasPaid(String studentId, String courseId) {
        return paymentRepository
            .findByStudentIdAndCourseIdAndStatus(studentId, courseId, "SUCCESS")
            .isPresent();
    }

    /** Thrown when student already has a SUCCESS payment for the course */
    public static class AlreadyPaidException extends RuntimeException {
        private final Payment payment;
        public AlreadyPaidException(Payment payment) {
            super("Already paid for course " + payment.getCourseId());
            this.payment = payment;
        }
        public Payment getPayment() { return payment; }
    }
}
