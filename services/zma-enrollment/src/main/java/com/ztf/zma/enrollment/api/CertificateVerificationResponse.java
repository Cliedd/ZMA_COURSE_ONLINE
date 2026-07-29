package com.ztf.zma.enrollment.api;

import java.time.LocalDateTime;

/**
 * Public, non-sensitive view of a certificate returned by the verification
 * endpoint. Deliberately excludes studentId (the only student identifier
 * stored is their email — see CertificateController for the rationale on
 * why it is omitted entirely rather than partially masked).
 */
public record CertificateVerificationResponse(
        boolean valid,
        String certNumber,
        String courseTitle,
        LocalDateTime issuedAt
) {
}
