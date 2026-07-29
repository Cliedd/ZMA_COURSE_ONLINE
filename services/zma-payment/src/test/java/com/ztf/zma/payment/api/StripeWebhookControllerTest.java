package com.ztf.zma.payment.api;

import com.ztf.zma.payment.domain.Payment;
import com.ztf.zma.payment.repository.PaymentRepository;
import com.ztf.zma.payment.support.AbstractIntegrationTest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.HexFormat;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Real signature verification, replicating Stripe's own scheme (the
 * "Stripe-Signature" header is "t=<unix ts>,v1=<hex hmac-sha256 of
 * '<ts>.<raw body>'>") — not mocked. Uses the Stripe SDK's own
 * Webhook.constructEvent under the hood via the real controller endpoint.
 */
class StripeWebhookControllerTest extends AbstractIntegrationTest {

    // Matches stripe.webhook-secret in application-test.properties.
    private static final String WEBHOOK_SECRET = "whsec_test_dummy_secret";

    @Autowired
    private PaymentRepository paymentRepository;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = mockMvc();
        paymentRepository.deleteAll();
    }

    private String stripeSignatureHeader(String payload) throws Exception {
        long timestamp = Instant.now().getEpochSecond();
        String signedPayload = timestamp + "." + payload;
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(WEBHOOK_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hash = mac.doFinal(signedPayload.getBytes(StandardCharsets.UTF_8));
        String hex = HexFormat.of().formatHex(hash);
        return "t=" + timestamp + ",v1=" + hex;
    }

    private Payment pendingPayment(String id) {
        Payment p = new Payment();
        p.setId(id);
        p.setStudentId("stripe-buyer@zma.test");
        p.setCourseId("course-stripe");
        p.setCourseTitle("Jazz Piano");
        p.setAmount(29.99);
        p.setCurrency("usd");
        p.setStatus("PENDING");
        p.setProvider("STRIPE_CARD");
        p.setTransactionId("cs_test_session_123");
        return paymentRepository.save(p);
    }

    private String checkoutSessionCompletedPayload(String paymentId, String paymentStatus) {
        return "{"
                + "\"id\":\"evt_test_1\","
                + "\"object\":\"event\","
                + "\"api_version\":\"2024-06-20\","
                + "\"type\":\"checkout.session.completed\","
                + "\"data\":{\"object\":{"
                + "\"id\":\"cs_test_session_123\","
                + "\"object\":\"checkout.session\","
                + "\"client_reference_id\":\"" + paymentId + "\","
                + "\"payment_status\":\"" + paymentStatus + "\""
                + "}}}";
    }

    @Test
    void webhook_rejectsRequestWithoutSignature() throws Exception {
        mockMvc.perform(post("/api/v1/payments/webhook/stripe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(checkoutSessionCompletedPayload("some-id", "paid")))
                .andExpect(status().isForbidden());
    }

    @Test
    void webhook_rejectsRequestWithInvalidSignature() throws Exception {
        mockMvc.perform(post("/api/v1/payments/webhook/stripe")
                        .header("Stripe-Signature", "t=1,v1=deadbeef")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(checkoutSessionCompletedPayload("some-id", "paid")))
                .andExpect(status().isForbidden());
    }

    @Test
    void webhook_validSignature_checkoutCompleted_paid_confirmsPayment() throws Exception {
        Payment payment = pendingPayment("pay-stripe-1");
        String payload = checkoutSessionCompletedPayload(payment.getId(), "paid");
        String signature = stripeSignatureHeader(payload);

        mockMvc.perform(post("/api/v1/payments/webhook/stripe")
                        .header("Stripe-Signature", signature)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());

        Payment updated = paymentRepository.findById(payment.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo("SUCCESS");
        assertThat(updated.getConfirmedAt()).isNotNull();
    }

    @Test
    void webhook_validSignature_checkoutCompleted_notPaid_doesNotConfirm() throws Exception {
        // e.g. an async payment method (some bank redirects) can complete the
        // Checkout Session before the underlying payment actually settles.
        Payment payment = pendingPayment("pay-stripe-2");
        String payload = checkoutSessionCompletedPayload(payment.getId(), "unpaid");
        String signature = stripeSignatureHeader(payload);

        mockMvc.perform(post("/api/v1/payments/webhook/stripe")
                        .header("Stripe-Signature", signature)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());

        Payment unchanged = paymentRepository.findById(payment.getId()).orElseThrow();
        assertThat(unchanged.getStatus()).isEqualTo("PENDING");
    }

    @Test
    void webhook_isIdempotent_duplicateDeliveryDoesNotDoubleConfirm() throws Exception {
        Payment payment = pendingPayment("pay-stripe-3");
        String payload = checkoutSessionCompletedPayload(payment.getId(), "paid");

        // Stripe retries webhook delivery — simulate that exact scenario.
        mockMvc.perform(post("/api/v1/payments/webhook/stripe")
                        .header("Stripe-Signature", stripeSignatureHeader(payload))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/payments/webhook/stripe")
                        .header("Stripe-Signature", stripeSignatureHeader(payload))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());

        Payment updated = paymentRepository.findById(payment.getId()).orElseThrow();
        assertThat(updated.getStatus()).isEqualTo("SUCCESS");
    }

    @Test
    void webhook_ignoresUnrelatedEventTypes() throws Exception {
        String payload = "{\"id\":\"evt_2\",\"object\":\"event\",\"api_version\":\"2024-06-20\",\"type\":\"payment_intent.created\",\"data\":{\"object\":{}}}";
        mockMvc.perform(post("/api/v1/payments/webhook/stripe")
                        .header("Stripe-Signature", stripeSignatureHeader(payload))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk());
    }
}
