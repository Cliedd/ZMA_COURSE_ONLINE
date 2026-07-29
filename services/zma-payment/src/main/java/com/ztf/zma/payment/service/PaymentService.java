package com.ztf.zma.payment.service;

import com.ztf.zma.payment.domain.Payment;
import com.ztf.zma.payment.infrastructure.CatalogClient;
import com.ztf.zma.payment.infrastructure.CommunityNotificationClient;
import com.ztf.zma.payment.infrastructure.EnrollmentClient;
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

    public PaymentService(PaymentRepository paymentRepository,
                          EnrollmentClient enrollmentClient,
                          CatalogClient catalogClient,
                          CommunityNotificationClient communityNotificationClient) {
        this.paymentRepository = paymentRepository;
        this.enrollmentClient  = enrollmentClient;
        this.catalogClient     = catalogClient;
        this.communityNotificationClient = communityNotificationClient;
    }

    /**
     * Initiates a checkout — creates a PENDING payment and returns a checkout URL.
     *
     * In simulation mode the URL is a placeholder and the payment is immediately
     * confirmable via PATCH /{id}/confirm.
     * In production replace this with a real CinetPay API call.
     */
    @Transactional
    public Payment initiateCheckout(String studentId, String courseId, String promoCode) {
        // Idempotent: return existing pending or successful payment
        paymentRepository.findByStudentIdAndCourseIdAndStatus(studentId, courseId, "SUCCESS")
            .ifPresent(p -> { throw new AlreadyPaidException(p); });

        // Fetch authoritative price from catalog
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

        // Free course → enroll directly, skip payment gateway
        if (amount <= 0) {
            Payment free = new Payment();
            free.setStudentId(studentId);
            free.setCourseId(courseId);
            free.setCourseTitle(title);
            free.setTeacherEmail(teacherEmail);
            free.setAmount(0.0);
            free.setCurrency(currency);
            free.setStatus("SUCCESS");
            free.setConfirmedAt(Instant.now());
            free.setPromoCode(promoCode);
            Payment saved = paymentRepository.save(free);
            enrollmentClient.enroll(studentId, courseId, title, level);
            return saved;
        }

        // Paid course → create PENDING record, generate simulated checkout URL
        Payment payment = new Payment();
        payment.setStudentId(studentId);
        payment.setCourseId(courseId);
        payment.setCourseTitle(title);
        payment.setTeacherEmail(teacherEmail);
        payment.setAmount(amount);
        payment.setCurrency(currency);
        payment.setStatus("PENDING");
        payment.setPromoCode(promoCode);
        // Simulate CinetPay transaction ID
        payment.setTransactionId("ZMA-TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase());
        // In production: call CinetPay API here and store real checkoutUrl
        payment.setCheckoutUrl("/api/v1/payments/" + "PENDING_ID" + "/simulate-confirm");
        Payment saved = paymentRepository.save(payment);
        saved.setCheckoutUrl("/api/v1/payments/" + saved.getId() + "/confirm");
        return paymentRepository.save(saved);
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
     * Confirms payment by CinetPay transaction ID (webhook path).
     * Delegates to confirmPayment (idempotent check above prevents double-notification).
     */
    @Transactional
    public Payment confirmByTransactionId(String transactionId) {
        Payment payment = paymentRepository.findByTransactionId(transactionId)
            .orElseThrow(() -> new RuntimeException("Payment not found for transaction: " + transactionId));
        if ("SUCCESS".equals(payment.getStatus())) return payment; // idempotent
        return confirmPayment(payment.getId());
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
