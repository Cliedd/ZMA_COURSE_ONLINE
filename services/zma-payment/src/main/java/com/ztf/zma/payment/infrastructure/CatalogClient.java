package com.ztf.zma.payment.infrastructure;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Fetches authoritative course price from zma-catalog.
 * If catalog is unavailable the caller falls back to the client-supplied amount.
 */
@Component
public class CatalogClient {

    private static final Logger log = LoggerFactory.getLogger(CatalogClient.class);

    private final RestClient restClient;

    public CatalogClient(
            @Value("${catalog.service.url:http://zma-catalog:8083}") String catalogUrl) {
        this.restClient = RestClient.builder().baseUrl(catalogUrl).build();
    }

    /**
     * Returns course info map or null if unavailable.
     * Expected keys: id, title, level, price, currency
     */
    @SuppressWarnings("unchecked")
    public Map<String, Object> getCourseInfo(String courseId) {
        try {
            return restClient.get()
                .uri("/api/v1/courses/internal/" + courseId)
                .retrieve()
                .body(Map.class);
        } catch (Exception ex) {
            log.warn("Could not fetch course {} from catalog: {}", courseId, ex.getMessage());
            return null;
        }
    }

    public Double getCoursePrice(String courseId) {
        Map<String, Object> info = getCourseInfo(courseId);
        if (info != null && info.get("price") != null) {
            return ((Number) info.get("price")).doubleValue();
        }
        return null;
    }

    public String getCourseTitle(String courseId) {
        Map<String, Object> info = getCourseInfo(courseId);
        if (info != null) {
            return (String) info.get("title");
        }
        return null;
    }
}
