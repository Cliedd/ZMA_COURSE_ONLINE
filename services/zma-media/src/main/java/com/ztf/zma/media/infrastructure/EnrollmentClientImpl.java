package com.ztf.zma.media.infrastructure;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Implementation of EnrollmentClient making calls to zma-enrollment's
 * GET /api/v1/enrollments/check endpoint.
 *
 * That endpoint reads the student ID from the caller's JWT (Authentication#getName()),
 * so this client forwards the SAME Authorization header received by zma-media rather
 * than minting its own service token — zma-enrollment authenticates as the original
 * requesting student.
 */
@Component
public class EnrollmentClientImpl implements EnrollmentClient {

    private static final Logger log = LoggerFactory.getLogger(EnrollmentClientImpl.class);

    private final RestClient restClient;

    public EnrollmentClientImpl(
            @Value("${enrollment.service.url:http://zma-enrollment:8085}") String baseUrl) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    }

    @Override
    @SuppressWarnings("unchecked")
    public boolean isEnrolled(String courseId, String authorizationHeader) {
        if (courseId == null || authorizationHeader == null || authorizationHeader.isBlank()) {
            return false;
        }
        try {
            Map<String, Object> body = restClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/api/v1/enrollments/check")
                            .queryParam("courseId", courseId)
                            .build())
                    .header(HttpHeaders.AUTHORIZATION, authorizationHeader)
                    .retrieve()
                    .body(Map.class);
            return body != null && Boolean.TRUE.equals(body.get("enrolled"));
        } catch (Exception e) {
            // Fail closed: a network error or enrollment-service outage must deny
            // access, never silently grant it.
            log.warn("Enrollment check failed for course={}: {}", courseId, e.getMessage());
            return false;
        }
    }
}
