package com.ztf.zma.enrollment.api;

import com.ztf.zma.enrollment.domain.Certificate;
import com.ztf.zma.enrollment.service.EnrollmentService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/certificates")
public class CertificateController {

    private final EnrollmentService enrollmentService;

    public CertificateController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @GetMapping("/{id}")
    public Certificate getCertificate(@PathVariable String id) {
        return enrollmentService.getCertificate(id);
    }

    @GetMapping("/student/{studentId}")
    public List<Certificate> getCertificatesByStudent(@PathVariable String studentId) {
        return enrollmentService.getCertificatesByStudent(studentId);
    }

    /**
     * Public verification endpoint — no JWT required (see SecurityConfig permitAll).
     * Meant to be shared by a student with a third party (e.g. an employer) to prove
     * a certificate is genuine, so the response is deliberately minimal:
     *  - no studentId: the only student identifier stored on Certificate is their
     *    email, which is PII and not needed to prove a certificate's authenticity.
     *  - no internal ids (certificate id, courseId): not needed by a verifier.
     * Unknown certificate numbers return 404 (not 200 with valid:false) so a
     * verifier's tooling can rely on plain HTTP status semantics.
     */
    @GetMapping("/verify/{certNumber}")
    public CertificateVerificationResponse verify(@PathVariable String certNumber) {
        Certificate cert = enrollmentService.getCertificateByCertNumber(certNumber);
        return new CertificateVerificationResponse(
                true,
                cert.getCertNumber(),
                cert.getCourseTitle(),
                cert.getIssuedAt());
    }
}
