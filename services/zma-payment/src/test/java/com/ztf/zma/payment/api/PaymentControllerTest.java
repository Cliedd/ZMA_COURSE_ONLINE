package com.ztf.zma.payment.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ztf.zma.payment.domain.Payment;
import com.ztf.zma.payment.infrastructure.CatalogClient;
import com.ztf.zma.payment.infrastructure.EnrollmentClient;
import com.ztf.zma.payment.repository.PaymentRepository;
import com.ztf.zma.payment.support.AbstractIntegrationTest;
import com.ztf.zma.payment.support.JwtTestUtils;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * Real integration tests backed by H2 database (PostgreSQL mode).
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

    @Test
    void webhook_rejectsRequestWithoutSignature() throws Exception {
        mockMvc.perform(post("/api/v1/payments/webhook/cinetpay")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"cpm_trans_id\":\"ZMA-1\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void webhook_rejectsRequestWithInvalidSignature() throws Exception {
        mockMvc.perform(post("/api/v1/payments/webhook/cinetpay")
                        .header("x-token", "invalid-signature")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"cpm_trans_id\":\"ZMA-1\"}"))
                .andExpect(status().isForbidden());
    }

    @Test
    void webhook_acceptsRequestWithValidSignature_andConfirmsPayment() throws Exception {
        Payment p = new Payment();
        p.setStudentId("student-1");
        p.setCourseId("course-1");
        p.setAmount(5000.0);
        p.setCurrency("XAF");
        p.setStatus("PENDING");
        p.setTransactionId("ZMA-TXN-GOODSIG");
        paymentRepository.save(p);

        String payload = "{\"cpm_trans_id\":\"ZMA-TXN-GOODSIG\",\"cpm_result\":\"00\",\"cpm_user_id\":\"student-1\"}";
        String signature = hmacSignature(payload);

        mockMvc.perform(post("/api/v1/payments/webhook/cinetpay")
                        .header("x-token", signature)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isOk())
                .andExpect(content().string("Payment confirmed"));

        Payment updated = paymentRepository.findByTransactionId("ZMA-TXN-GOODSIG").orElseThrow();
        assertThat(updated.getStatus()).isEqualTo("SUCCESS");
        assertThat(updated.getConfirmedAt()).isNotNull();

        verify(enrollmentClient).enroll(eq("student-1"), eq("course-1"), any(), any());
    }

    @Test
    void checkout_computesPriceServerSideFromCatalog_notFromClient() throws Exception {
        when(catalogClient.getCourseInfo("course-paid")).thenReturn(Map.of(
                "id", "course-paid",
                "title", "Guitar Mastery",
                "level", "ADVANCED",
                "price", 15000
        ));

        String token = JwtTestUtils.token("buyer@zma.test", "STUDENT");

        mockMvc.perform(post("/api/v1/payments/checkout")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"courseId\":\"course-paid\"}"))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.amount").value(15000.0))
                .andExpect(jsonPath("$.status").value("PENDING"));
    }

    @Test
    void confirmAndCheck_reflectPaymentStatus() throws Exception {
        when(catalogClient.getCourseInfo("course-confirm")).thenReturn(Map.of(
                "id", "course-confirm", "title", "Drums 101", "level", "BEGINNER", "price", 3000
        ));
        String token = JwtTestUtils.token("payer@zma.test", "STUDENT");

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
        String studentToken = JwtTestUtils.token("owner@zma.test", "STUDENT");

        String response = mockMvc.perform(post("/api/v1/payments/checkout")
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"courseId\":\"course-refund\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String paymentId = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(patch("/api/v1/payments/{id}/confirm", paymentId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/payments/{id}/refund", paymentId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        String adminToken = JwtTestUtils.token("admin@zma.test", "ADMIN");
        mockMvc.perform(post("/api/v1/payments/{id}/refund", paymentId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REFUNDED"));
    }
}
