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
}
