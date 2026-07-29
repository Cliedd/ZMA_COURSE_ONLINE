package com.ztf.zma.users.infrastructure;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.List;

/**
 * Calls zma-catalog's GET /api/v1/courses/teacher/{email} to count a teacher's courses.
 * Mirrors zma-payment's CatalogClientImpl RestClient pattern.
 */
@Component
public class CatalogClientImpl implements CatalogClient {

    private static final Logger log = LoggerFactory.getLogger(CatalogClientImpl.class);

    private final RestClient restClient;

    public CatalogClientImpl(@Value("${catalog.service.url:http://zma-catalog:8083}") String catalogUrl) {
        this.restClient = RestClient.builder().baseUrl(catalogUrl).build();
    }

    @Override
    public int countCoursesByTeacherEmail(String email) {
        try {
            List<?> courses = restClient.get()
                .uri("/api/v1/courses/teacher/{email}", email)
                .retrieve()
                .body(List.class);
            return courses != null ? courses.size() : 0;
        } catch (Exception ex) {
            log.warn("Could not fetch course count for teacher {}: {}", email, ex.getMessage());
            return 0;
        }
    }
}
