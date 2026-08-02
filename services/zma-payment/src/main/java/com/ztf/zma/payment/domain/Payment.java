package com.ztf.zma.payment.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "payments")
public class Payment {
    /** Assigned by the application (PaymentService, before Stripe session
     *  creation) so it can be embedded as Stripe's client_reference_id and
     *  in the success/cancel return URLs — no @GeneratedValue here:
     *  Hibernate 6's built-in UUID generator overwrites any id set before
     *  save(), which silently orphaned every payment (Stripe held one UUID,
     *  the persisted row got a different one, so the webhook lookup and
     *  GET /payments/{id} right after checkout always 404'd). */
    @Id
    private String id;

    @Column(nullable = false)
    private String studentId;

    @Column(nullable = false)
    private String courseId;

    private String courseTitle;

    /** Denormalized from zma-catalog at checkout time — avoids an N-call
     *  fan-out to the catalog service when aggregating teacher payouts. */
    private String teacherEmail;

    @Column(nullable = false)
    private Double amount;

    /** USD, XAF, EUR… — every price displayed by the frontend today is USD. */
    @Column(nullable = false, columnDefinition = "varchar(10) default 'USD'")
    private String currency = "USD";

    /** PENDING | SUCCESS | FAILED | REFUNDED */
    @Column(nullable = false)
    private String status;

    /** STRIPE_CARD | STRIPE_PAYPAL | CINETPAY | FREE — which real gateway (if any) handled this payment. */
    private String provider;

    /** CinetPay transaction ID, or Stripe Checkout Session ID for Stripe payments. */
    private String transactionId;

    /** Redirect URL returned by payment gateway */
    @Column(columnDefinition = "TEXT")
    private String checkoutUrl;

    /** Optional promo code applied */
    private String promoCode;

    private Instant createdAt;
    private Instant confirmedAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }
    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }
    public String getTeacherEmail() { return teacherEmail; }
    public void setTeacherEmail(String teacherEmail) { this.teacherEmail = teacherEmail; }
    public Double getAmount() { return amount; }
    public void setAmount(Double amount) { this.amount = amount; }
    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public String getTransactionId() { return transactionId; }
    public void setTransactionId(String transactionId) { this.transactionId = transactionId; }
    public String getCheckoutUrl() { return checkoutUrl; }
    public void setCheckoutUrl(String checkoutUrl) { this.checkoutUrl = checkoutUrl; }
    public String getPromoCode() { return promoCode; }
    public void setPromoCode(String promoCode) { this.promoCode = promoCode; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getConfirmedAt() { return confirmedAt; }
    public void setConfirmedAt(Instant confirmedAt) { this.confirmedAt = confirmedAt; }
}
