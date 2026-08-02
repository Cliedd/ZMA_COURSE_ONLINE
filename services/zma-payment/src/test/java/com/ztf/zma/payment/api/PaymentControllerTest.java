package com.ztf.zma.payment.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ztf.zma.payment.domain.Payment;
import com.ztf.zma.payment.infrastructure.CatalogClient;
import com.ztf.zma.payment.infrastructure.CinetPayClient;
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
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyDouble;
import static org.mockito.ArgumentMatchers.anyString;
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
 * Real integration tests backed by H2 database (PostgreSQL mode). StripeClient
 * and CinetPayClient are mocked — these tests exercise our own routing/
 * persistence/security logic, not third-party gateways (Stripe's Checkout
 * Session creation is covered separately, at the unit level, where it can be
 * tested without real network calls or live API keys).
 */
class PaymentControllerTest extends AbstractIntegrationTest {

    private static final String WEBHOOK_SECRET = "test-webhook-secret-for-hmac";
    private static final String ADMIN_TOKEN = JwtTestUtils.token("admin@zma.test", "ADMIN");

    @Autowired
    private PaymentRepository paymentRepository;

    @MockBean
    private CatalogClient catalogClient;

    @MockBean
    private EnrollmentClient enrollmentClient;

    @MockBean
    private CinetPayClient cinetPayClient;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @BeforeEach
    void setUp() {
        mockMvc = mockMvc();
        paymentRepository.deleteAll();
        when(cinetPayClient.initiatePayment(anyString(), anyDouble(), anyString()))
                .thenReturn(new CinetPayClient.CheckoutResult("https://fake-cinetpay.test/pay/abc", "tok-abc"));
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
        p.setId(UUID.randomUUID().toString());
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
                        .content("{\"courseId\":\"course-paid\",\"provider\":\"CINETPAY\"}"))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.amount").value(15000.0))
                .andExpect(jsonPath("$.status").value("PENDING"))
                .andExpect(jsonPath("$.checkoutUrl").value("https://fake-cinetpay.test/pay/abc"));
    }

    @Test
    void checkout_withoutProvider_isRejectedForPaidCourse() throws Exception {
        when(catalogClient.getCourseInfo("course-noprovider")).thenReturn(Map.of(
                "id", "course-noprovider", "title", "Piano", "level", "BEGINNER", "price", 1000
        ));
        String token = JwtTestUtils.token("noprovider@zma.test", "STUDENT");

        mockMvc.perform(post("/api/v1/payments/checkout")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"courseId\":\"course-noprovider\"}"))
                .andExpect(status().isBadRequest());
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
                        .content("{\"courseId\":\"course-confirm\",\"provider\":\"CINETPAY\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String paymentId = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(get("/api/v1/payments/check")
                        .header("Authorization", "Bearer " + token)
                        .param("courseId", "course-confirm"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paid").value(false));

        // Manual confirm is ADMIN-only now that real gateways exist — a
        // student confirming their own payment would be a critical hole.
        mockMvc.perform(patch("/api/v1/payments/{id}/confirm", paymentId)
                        .header("Authorization", "Bearer " + ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("SUCCESS"));

        mockMvc.perform(get("/api/v1/payments/check")
                        .header("Authorization", "Bearer " + token)
                        .param("courseId", "course-confirm"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.paid").value(true));
    }

    @Test
    void confirm_isRejectedForNonAdmin() throws Exception {
        when(catalogClient.getCourseInfo("course-selfconfirm")).thenReturn(Map.of(
                "id", "course-selfconfirm", "title", "Bass", "level", "BEGINNER", "price", 2500
        ));
        String token = JwtTestUtils.token("selfconfirm@zma.test", "STUDENT");
        String response = mockMvc.perform(post("/api/v1/payments/checkout")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"courseId\":\"course-selfconfirm\",\"provider\":\"CINETPAY\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String paymentId = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(patch("/api/v1/payments/{id}/confirm", paymentId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
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
                        .content("{\"courseId\":\"course-refund\",\"provider\":\"CINETPAY\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String paymentId = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(patch("/api/v1/payments/{id}/confirm", paymentId)
                        .header("Authorization", "Bearer " + ADMIN_TOKEN))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/v1/payments/{id}/refund", paymentId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());

        mockMvc.perform(post("/api/v1/payments/{id}/refund", paymentId)
                        .header("Authorization", "Bearer " + ADMIN_TOKEN))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("REFUNDED"));
    }

    @Test
    void invoicePdf_isRejectedWhilePending() throws Exception {
        when(catalogClient.getCourseInfo("course-invoice")).thenReturn(Map.of(
                "id", "course-invoice", "title", "Saxophone", "level", "BEGINNER", "price", 4000,
                "teacherEmail", "teacher-sax@zma.test"
        ));
        String token = JwtTestUtils.token("invoice-buyer@zma.test", "STUDENT");

        String response = mockMvc.perform(post("/api/v1/payments/checkout")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"courseId\":\"course-invoice\",\"provider\":\"CINETPAY\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String paymentId = objectMapper.readTree(response).get("id").asText();

        mockMvc.perform(get("/api/v1/payments/{id}/invoice/pdf", paymentId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isConflict());
    }

    @Test
    void invoicePdf_isRejectedForNonOwnerNonAdmin() throws Exception {
        when(catalogClient.getCourseInfo("course-invoice2")).thenReturn(Map.of(
                "id", "course-invoice2", "title", "Cello", "level", "BEGINNER", "price", 4000,
                "teacherEmail", "teacher-cello@zma.test"
        ));
        String ownerToken = JwtTestUtils.token("owner2@zma.test", "STUDENT");
        String response = mockMvc.perform(post("/api/v1/payments/checkout")
                        .header("Authorization", "Bearer " + ownerToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"courseId\":\"course-invoice2\",\"provider\":\"CINETPAY\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String paymentId = objectMapper.readTree(response).get("id").asText();
        mockMvc.perform(patch("/api/v1/payments/{id}/confirm", paymentId)
                        .header("Authorization", "Bearer " + ADMIN_TOKEN))
                .andExpect(status().isOk());

        String strangerToken = JwtTestUtils.token("stranger@zma.test", "STUDENT");
        mockMvc.perform(get("/api/v1/payments/{id}/invoice/pdf", paymentId)
                        .header("Authorization", "Bearer " + strangerToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void invoicePdf_downloadsForOwnerAfterConfirmation() throws Exception {
        when(catalogClient.getCourseInfo("course-invoice3")).thenReturn(Map.of(
                "id", "course-invoice3", "title", "Flute", "level", "BEGINNER", "price", 4000,
                "teacherEmail", "teacher-flute@zma.test"
        ));
        String token = JwtTestUtils.token("invoice-owner3@zma.test", "STUDENT");
        String response = mockMvc.perform(post("/api/v1/payments/checkout")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"courseId\":\"course-invoice3\",\"provider\":\"CINETPAY\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        String paymentId = objectMapper.readTree(response).get("id").asText();
        mockMvc.perform(patch("/api/v1/payments/{id}/confirm", paymentId)
                        .header("Authorization", "Bearer " + ADMIN_TOKEN))
                .andExpect(status().isOk());

        byte[] pdf = mockMvc.perform(get("/api/v1/payments/{id}/invoice/pdf", paymentId)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(org.springframework.test.web.servlet.result.MockMvcResultMatchers.header()
                        .string("Content-Type", "application/pdf"))
                .andReturn().getResponse().getContentAsByteArray();

        assertThat(pdf).isNotEmpty();
        assertThat(new String(pdf, 0, 5, StandardCharsets.US_ASCII)).isEqualTo("%PDF-");
    }
}
