package com.ztf.zma.enrollment.infrastructure;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Client to zma-catalog — validates course existence before enrollment.
 */
@Component
public class CatalogClient {

    private static final Logger log = LoggerFactory.getLogger(CatalogClient.class);

    private final RestClient restClient;

    public CatalogClient(
            @Value("${catalog.service.url:http://zma-catalog:8083}") String catalogUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(catalogUrl)
                .build();
    }

    /**
     * Returns basic course info: {id, title, level, price}.
     * Returns null if course not found or service unavailable.
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getCourseInfo(String courseId) {
        try {
            return restClient.get()
                .uri("/api/v1/courses/" + courseId)
                .retrieve()
                .body(Map.class);
        } catch (Exception ex) {
            log.warn("Could not fetch course {} from catalog: {}", courseId, ex.getMessage());
            return null;
        }
    }

    /**
     * Notifies the catalog service that a new student has enrolled in the given course,
     * so the denormalized studentsCount field is kept in sync.
     * Fire-and-forget: failures are logged but do not fail the enrollment.
     */
    public void incrementStudentsCount(String courseId) {
        try {
            restClient.post()
                .uri("/api/v1/courses/internal/" + courseId + "/increment-students")
                .retrieve()
                .toBodilessEntity();
        } catch (Exception ex) {
            log.warn("Could not increment studentsCount for course {}: {}", courseId, ex.getMessage());
        }
    }

    /**
     * Pushes an exact enrollment count for a course to the catalog (backfill/resync).
     * Fire-and-forget: failures are logged but do not fail the caller.
     */
    public void syncStudentsCount(String courseId, long count) {
        try {
            restClient.post()
                .uri("/api/v1/courses/internal/" + courseId + "/sync-students")
                .contentType(org.springframework.http.MediaType.APPLICATION_JSON)
                .body(Map.of("count", count))
                .retrieve()
                .toBodilessEntity();
        } catch (Exception ex) {
            log.warn("Could not sync studentsCount for course {}: {}", courseId, ex.getMessage());
        }
    }

    /** Returns total lesson count for certificate validation */
    public Integer getLessonCount(String courseId) {
        try {
            Map<String, Object> info = getCourseInfo(courseId);
            if (info != null && info.containsKey("lessonCount")) {
                return ((Number) info.get("lessonCount")).intValue();
            }
        } catch (Exception ex) {
            log.warn("Could not fetch lesson count for course {}: {}", courseId, ex.getMessage());
        }
        return null;
    }
}
