package com.ztf.zma.payment.api;

import com.ztf.zma.payment.domain.Payment;
import com.ztf.zma.payment.repository.PaymentRepository;
import com.ztf.zma.payment.support.AbstractIntegrationTest;
import com.ztf.zma.payment.support.JwtTestUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.web.servlet.MockMvc;

import java.time.Instant;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class PaymentAnalyticsControllerTest extends AbstractIntegrationTest {

    @Autowired
    private PaymentRepository paymentRepository;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = mockMvc();
        paymentRepository.deleteAll();

        paymentRepository.save(successPayment("student-a", "course-1", "teacher-a@zma.test", 10000.0));
        paymentRepository.save(successPayment("student-b", "course-1", "teacher-a@zma.test", 10000.0));
        paymentRepository.save(successPayment("student-c", "course-2", "teacher-b@zma.test", 5000.0));
        // Not confirmed — must be excluded from every aggregate below
        Payment pending = successPayment("student-d", "course-2", "teacher-b@zma.test", 5000.0);
        pending.setStatus("PENDING");
        pending.setConfirmedAt(null);
        paymentRepository.save(pending);
    }

    private Payment successPayment(String studentId, String courseId, String teacherEmail, double amount) {
        Payment p = new Payment();
        p.setId(UUID.randomUUID().toString());
        p.setStudentId(studentId);
        p.setCourseId(courseId);
        p.setTeacherEmail(teacherEmail);
        p.setAmount(amount);
        p.setCurrency("XAF");
        p.setStatus("SUCCESS");
        p.setConfirmedAt(Instant.now());
        return p;
    }

    @Test
    void revenue_isRejectedForNonAdmin() throws Exception {
        String studentToken = JwtTestUtils.token("student@zma.test", "STUDENT");
        mockMvc.perform(get("/api/v1/payments/analytics/revenue")
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isForbidden());
    }

    @Test
    void revenue_asAdmin_sumsOnlySuccessfulPayments() throws Exception {
        String adminToken = JwtTestUtils.token("admin@zma.test", "ADMIN");
        mockMvc.perform(get("/api/v1/payments/analytics/revenue")
                        .header("Authorization", "Bearer " + adminToken)
                        .param("groupBy", "month"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.totalRevenue").value(25000.0))
                .andExpect(jsonPath("$.totalTransactions").value(3));
    }

    @Test
    void teacherPayouts_asAdmin_splitsRevenueByConfiguredRate() throws Exception {
        String adminToken = JwtTestUtils.token("admin@zma.test", "ADMIN");
        mockMvc.perform(get("/api/v1/payments/analytics/teacher-payouts")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.teacherShareRate").value(0.70))
                .andExpect(jsonPath("$.payouts[0].teacherEmail").value("teacher-a@zma.test"))
                .andExpect(jsonPath("$.payouts[0].totalRevenue").value(20000.0))
                .andExpect(jsonPath("$.payouts[0].teacherShare").value(14000.0))
                .andExpect(jsonPath("$.payouts[0].platformShare").value(6000.0))
                .andExpect(jsonPath("$.payouts[1].teacherEmail").value("teacher-b@zma.test"))
                .andExpect(jsonPath("$.payouts[1].totalRevenue").value(5000.0));
    }
}
