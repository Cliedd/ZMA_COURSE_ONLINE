package com.ztf.zma.enrollment.repository;

import com.ztf.zma.enrollment.domain.Enrollment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EnrollmentRepository extends JpaRepository<Enrollment, String> {
    Optional<Enrollment> findByStudentIdAndCourseId(String studentId, String courseId);
    List<Enrollment> findByStudentId(String studentId);
    List<Enrollment> findByCourseId(String courseId);
    boolean existsByStudentIdAndCourseId(String studentId, String courseId);
    long countByCourseId(String courseId);
}
