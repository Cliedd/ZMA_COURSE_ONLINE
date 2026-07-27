package com.ztf.zma.payment.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ztf.zma.payment.infrastructure.CatalogClient;
import com.ztf.zma.payment.infrastructure.EnrollmentClient;
import com.ztf.zma.payment.repository.PaymentRepository;
import com.ztf.zma.payment.domain.Payment;
import com.ztf.zma.payment.support.AbstractIntegrationTest;
import com.ztf.zma.payment.support.TestJwt;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.HexFormat;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Real integration tests against a Testcontainers PostgreSQL database.
 * Covers the CinetPay webhook signature verification (the critical fix),
 * checkout, confirmation, and the /payments/check endpoint.
 */
class PaymentControllerTest extends AbstractIntegrationTest {

    private static final String WEBHOOK_SECRET = "test-webhook-secret-for-hmac";

    @Autowired
    private PaymentRepository paymentRepository;

    @MockBean
    private CatalogClient catalogClient;

    @MockBean
    private EnrollmentClient enrollmentClient;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = mockMvc();
        paymentRepository.deleteAll();
    }

    private String hmacSignature(String rawBody) throws Exception {
        Mac mac = Mac.getInstance("HmacSHA256");
        mac.init(new SecretKeySpec(WEBHOOK_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
        byte[] hash = mac.doFinal(rawBody.getBytes(StandardCharsets.UTF_8));
        return HexFormat.of().formatHex(hash);
    }

    // ── CRITICAL: webhook signature verification ───────────────────────────

    @Test
    void webhook_rejectsRequestWithoutSignature() throws Exception {
        Payment pending = new Payment();
        pending.setStudentId("student@zma.test");
        pending.setCourseId("course-1");
        pending.setAmount(5000.0);
        pending.setCurrency("XAF");
        pending.setStatus("PENDING");
        pending.setTransactionId("ZMA-TXN-NOSIG");
        paymentRepository.save(pending);

        String body = objectMapper.writeValueAsString(Map.of(
                "cpm_trans_id", "ZMA-TXN-NOSIG",
                "cpm_result", "00"
        ));

        // No x-token header at all
        mockMvc.perform(post("/api/v1/payments/webhook/cinetpay")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());

        Payment stillPending = paymentRepository.findByTransactionId("ZMA-TXN-NOSIG").orElseThrow();
        assertThat(stillPending.getStatus()).isEqualTo("PENDING");
    }

    @Test
    void webhook_rejectsRequestWithInvalidSignature() throws Exception {
        Payment pending = new Payment();
        pending.setStudentId("student@zma.test");
        pending.setCourseId("course-2");
        pending.setAmount(5000.0);
        pending.setCurrency("XAF");
        pending.setStatus("PENDING");
        pending.setTransactionId("ZMA-TXN-BADSIG");
        paymentRepository.save(pending);

        String body = objectMapper.writeValueAsString(Map.of(
                "cpm_trans_id", "ZMA-TXN-BADSIG",
                "cpm_result", "00"
        ));

        mockMvc.perform(post("/api/v1/payments/webhook/cinetpay")
                        .header("x-token", "0000not-the-right-signature0000")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isForbidden());

        Payment stillPending = paymentRepository.findByTransactionId("ZMA-TXN-BADSIG").orElseThrow();
        assertThat(stillPending.getStatus()).isEqualTo("PENDING");
        verifyNoInteractions(enrollmentClient);
    }

    @Test
    void webhook_acceptsRequestWithValidSignature_andConfirmsPayment() throws Exception {
        Payment pending = new Payment();
        pending.setStudentId("student@zma.test");
        pending.setCourseId("course-3");
        pending.setCourseTitle("Piano Basics");
        pending.setAmount(5000.0);
        pending.setCurrency("XAF");
        pending.setStatus("PENDING");
        pending.setTransactionId("ZMA-TXN-GOODSIG");
        paymentRepository.save(pending);

        String body = objectMapper.writeValueAsString(Map.of(
                "cpm_trans_id", "ZMA-TXN-GOODSIG",
                "cpm_result", "00"
        ));
        String signature = hmacSignature(body);

        mockMvc.perform(post("/api/v1/payments/webhook/cinetpay")
                        .header("x-token", signature)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isOk())
                .andExpect(content().string("Payment confirmed"));

        Payment confirmed = paymentRepository.findByTransactionId("ZMA-TXN-GOODSIG").orElseThrow();
        assertThat(confirmed.getStatus()).isEqualTo("SUCCESS");
        assertThat(confirmed.getConfirmedAt()).isNotNull();
        verify(enrollmentClient, times(1))
                .enroll(eq("student@zma.test"), eq("course-3"), eq("Piano Basics"), isNull());
    }

    @Test
    void webhook_missingBody_isBadRequest() throws Exception {
        mockMvc.perform(post("/api/v1/payments/webhook/cinetpay")
                        .header("x-token", "anything")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isBadRequest());
    }

    // ── Checkout / confirm / check ──────────────────────────────────────────

    @Test
    void checkout_computesPriceServerSideFromCatalog_notFromClient() throws Exception {
        when(catalogClient.getCourseInfo("course-paid")).thenReturn(Map.of(
                "id", "course-paid",
                "title", "Guitar Mastery",
                "level", "ADVANCED",
                "price", 15000
        ));

        String token = TestJwt.token("buyer@zma.test", "STUDENT");

        mockMvc.perform(post("/api/v1/payments/checkout")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"courseId\":\"course-paid\",\"promoCode\":null}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.amount").value(15000.0))
                .andExpect(jsonPath("$.status").value("PENDING"));

        // Even if a malicious client had tried to smuggle a different amount,
        // there is no "amount" field read from CheckoutRequest at all — the
        // server always asks the catalog service for the authoritative price.
    }

    @Test
    void confirmAndCheck_reflectPaymentStatus() throws Exception {
        when(catalogClient.getCourseInfo("course-confirm")).thenReturn(Map.of(
                "id", "course-confirm", "title", "Drums 101", "level", "BEGINNER", "price", 3000
        ));
        String token = TestJwt.token("payer@zma.test", "STUDENT");

        String response = mockMvc.perform(post("/api/v1/payments/checkout")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"courseId\":\"course-confirm\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String paymentId = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(get("/api/v1/payments/check")
                        .header("Authorization", "Bearer " + token)
                        .param("courseId", "course-confirm"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paid").value(false));

        mockMvc.perform(patch("/api/v1/payments/{id}/confirm", paymentId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));

        mockMvc.perform(get("/api/v1/payments/check")
                        .header("Authorization", "Bearer " + token)
                        .param("courseId", "course-confirm"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paid").value(true));
    }

    @Test
    void refund_isRejectedForNonAdmin() throws Exception {
        when(catalogClient.getCourseInfo("course-refund")).thenReturn(Map.of(
                "id", "course-refund", "title", "Violin", "level", "BEGINNER", "price", 2000
        ));
        String studentToken = TestJwt.token("owner@zma.test", "STUDENT");

        String response = mockMvc.perform(post("/api/v1/payments/checkout")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"courseId\":\"course-refund\"}"))
                .andReturn().getResponse().getContentAsString();
        String paymentId = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(patch("/api/v1/payments/{id}/confirm", paymentId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk());

        // Owner of the payment, but not ADMIN — must be rejected
        mockMvc.perform(post("/api/v1/payments/{id}/refund", paymentId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        String adminToken = TestJwt.token("admin@zma.test", "ADMIN");
        mockMvc.perform(post("/api/v1/payments/{id}/refund", paymentId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REFUNDED"));
    }
}
