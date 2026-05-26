package com.ztf.zma.payment.infrastructure;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Fire-and-forget call to zma-enrollment after a successful payment.
 * Failures are logged but never bubble up to the payment response.
 */
@Component
public class EnrollmentClient {

    private static final Logger log = LoggerFactory.getLogger(EnrollmentClient.class);

    private final RestClient restClient;

    public EnrollmentClient(
            @Value("${enrollment.service.url:http://zma-enrollment:8085}") String baseUrl) {
        this.restClient = RestClient.builder().baseUrl(baseUrl).build();
    }

    public void enroll(String studentId, String courseId, String courseTitle, String courseLevel) {
        try {
            restClient.post()
                .uri("/api/v1/enrollments/internal/enroll")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                    "studentId",   studentId,
                    "courseId",    courseId,
                    "courseTitle", courseTitle != null ? courseTitle : "",
                    "courseLevel", courseLevel != null ? courseLevel : ""
                ))
                .retrieve()
                .toBodilessEntity();
            log.info("Enrollment triggered for student={} course={}", studentId, courseId);
        } catch (Exception e) {
            log.warn("Could not trigger enrollment for student={} course={}: {}",
                     studentId, courseId, e.getMessage());
        }
    }
}
