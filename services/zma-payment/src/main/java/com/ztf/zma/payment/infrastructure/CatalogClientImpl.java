package com.ztf.zma.payment.infrastructure;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Implementation of CatalogClient fetching authoritative course price from zma-catalog.
 */
@Component
public class CatalogClientImpl implements CatalogClient {

    private static final Logger log = LoggerFactory.getLogger(CatalogClientImpl.class);

    private final RestClient restClient;

    public CatalogClientImpl(
            @Value("${catalog.service.url:http://zma-catalog:8083}") String catalogUrl) {
        this.restClient = RestClient.builder().baseUrl(catalogUrl).build();
    }

    @Override
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

    @Override
    public Double getCoursePrice(String courseId) {
        Map<String, Object> info = getCourseInfo(courseId);
        if (info != null && info.get("price") != null) {
            return ((Number) info.get("price")).doubleValue();
        }
        return null;
    }

    @Override
    public String getCourseTitle(String courseId) {
        Map<String, Object> info = getCourseInfo(courseId);
        if (info != null) {
            return (String) info.get("title");
        }
        return null;
    }
}
