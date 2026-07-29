package com.ztf.zma.enrollment.repository;

import com.ztf.zma.enrollment.domain.Certificate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CertificateRepository extends JpaRepository<Certificate, String> {
    Optional<Certificate> findByStudentIdAndCourseId(String studentId, String courseId);
    List<Certificate> findByStudentId(String studentId);
    Optional<Certificate> findByCertNumber(String certNumber);
}
