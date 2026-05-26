package com.ztf.zma.enrollment.service;

import com.ztf.zma.enrollment.domain.Certificate;
import com.ztf.zma.enrollment.domain.Enrollment;
import com.ztf.zma.enrollment.infrastructure.CatalogClient;
import com.ztf.zma.enrollment.infrastructure.CommunityClient;
import com.ztf.zma.enrollment.repository.CertificateRepository;
import com.ztf.zma.enrollment.repository.EnrollmentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class EnrollmentService {

    private static final Logger log = LoggerFactory.getLogger(EnrollmentService.class);

    private final EnrollmentRepository enrollmentRepository;
    private final CertificateRepository certificateRepository;
    private final CommunityClient communityClient;
    private final CatalogClient   catalogClient;

    public EnrollmentService(EnrollmentRepository enrollmentRepository,
                             CertificateRepository certificateRepository,
                             CommunityClient communityClient,
                             CatalogClient catalogClient) {
        this.enrollmentRepository = enrollmentRepository;
        this.certificateRepository = certificateRepository;
        this.communityClient = communityClient;
        this.catalogClient   = catalogClient;
    }

    @Transactional
    public Enrollment enroll(String studentId, String courseId,
                             String courseTitle, String courseLevel) {
        // Idempotent: return existing enrollment
        Optional<Enrollment> existing = enrollmentRepository
                .findByStudentIdAndCourseId(studentId, courseId);
        if (existing.isPresent()) return existing.get();

        // Validate course existence (non-blocking — if catalog is down, still enroll)
        String resolvedTitle = courseTitle;
        String resolvedLevel = courseLevel;
        if (resolvedTitle == null || resolvedTitle.isBlank()) {
            Map<String, Object> courseInfo = catalogClient.getCourseInfo(courseId);
            if (courseInfo != null) {
                resolvedTitle = (String) courseInfo.getOrDefault("title", "");
                resolvedLevel = (String) courseInfo.getOrDefault("level", "");
            }
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setStudentId(studentId);
        enrollment.setCourseId(courseId);
        enrollment.setCourseTitle(resolvedTitle);
        enrollment.setCourseLevel(resolvedLevel);
        Enrollment saved = enrollmentRepository.save(enrollment);

        // Notify student (fire-and-forget)
        communityClient.notifyEnrollment(studentId,
                resolvedTitle != null ? resolvedTitle : courseId);

        return saved;
    }

    public boolean isEnrolled(String studentId, String courseId) {
        return enrollmentRepository.existsByStudentIdAndCourseId(studentId, courseId);
    }

    public Optional<Enrollment> getEnrollmentByStudentAndCourse(String studentId, String courseId) {
        return enrollmentRepository.findByStudentIdAndCourseId(studentId, courseId);
    }

    public List<Enrollment> getEnrollmentsByStudent(String studentId) {
        return enrollmentRepository.findByStudentId(studentId);
    }

    public List<Enrollment> getEnrollmentsByCourse(String courseId) {
        return enrollmentRepository.findByCourseId(courseId);
    }

    public long countByCourse(String courseId) {
        return enrollmentRepository.countByCourseId(courseId);
    }

    public Enrollment getEnrollmentById(String id) {
        return enrollmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Enrollment not found"));
    }

    @Transactional
    public Enrollment updateProgress(String id, Double progress) {
        if (progress < 0 || progress > 100) {
            throw new RuntimeException("Progress must be between 0 and 100");
        }
        Enrollment enrollment = getEnrollmentById(id);
        enrollment.setProgress(progress);
        if (progress >= 100.0 && enrollment.getCompletedAt() == null) {
            enrollment.setCompletedAt(LocalDateTime.now());
        }
        Enrollment saved = enrollmentRepository.save(enrollment);
        if (progress >= 100.0) {
            issueCertificateIfNotExists(saved.getStudentId(), saved.getCourseId(),
                    saved.getCourseTitle());
        }
        return saved;
    }

    @Transactional
    public Enrollment updateCompletedLessons(String id, String completedLessonsJson) {
        Enrollment enrollment = getEnrollmentById(id);
        enrollment.setCompletedLessonsJson(completedLessonsJson);
        return enrollmentRepository.save(enrollment);
    }

    @Transactional
    private void issueCertificateIfNotExists(String studentId, String courseId,
                                              String courseTitle) {
        certificateRepository.findByStudentIdAndCourseId(studentId, courseId)
            .orElseGet(() -> {
                Certificate cert = new Certificate();
                cert.setStudentId(studentId);
                cert.setCourseId(courseId);
                cert.setCourseTitle(courseTitle);
                cert.setCertNumber("ZMA-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
                return certificateRepository.save(cert);
            });
    }

    @Transactional
    public void unenroll(String enrollmentId) {
        if (!enrollmentRepository.existsById(enrollmentId)) {
            throw new RuntimeException("Enrollment not found");
        }
        enrollmentRepository.deleteById(enrollmentId);
    }

    public Certificate getCertificate(String certId) {
        return certificateRepository.findById(certId)
                .orElseThrow(() -> new RuntimeException("Certificate not found"));
    }

    public List<Certificate> getCertificatesByStudent(String studentId) {
        return certificateRepository.findByStudentId(studentId);
    }
}
