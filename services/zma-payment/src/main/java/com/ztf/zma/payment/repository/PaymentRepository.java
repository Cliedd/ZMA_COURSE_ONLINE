package com.ztf.zma.payment.repository;

import com.ztf.zma.payment.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, String> {
    List<Payment> findByStudentId(String studentId);
    Optional<Payment> findByStudentIdAndCourseIdAndStatus(String studentId, String courseId, String status);
    Optional<Payment> findByTransactionId(String transactionId);
    List<Payment> findByCourseId(String courseId);
}
