package com.ztf.zma.users.infrastructure;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Calls zma-media's GET /api/v1/media/{id}/url to resolve a mediaId into a
 * display URL. Mirrors zma-payment's CatalogClientImpl RestClient pattern.
 */
@Component
public class MediaClientImpl implements MediaClient {

    private static final Logger log = LoggerFactory.getLogger(MediaClientImpl.class);

    private final RestClient restClient;

    public MediaClientImpl(@Value("${media.service.url:http://zma-media:8084}") String mediaUrl) {
        this.restClient = RestClient.builder().baseUrl(mediaUrl).build();
    }

    @Override
    @SuppressWarnings("unchecked")
    public String resolveAvatarUrl(String mediaId, String bearerToken) {
        try {
            Map<String, String> body = restClient.get()
                .uri("/api/v1/media/{id}/url", mediaId)
                .header("Authorization", "Bearer " + bearerToken)
                .retrieve()
                .body(Map.class);
            return body != null ? body.get("url") : null;
        } catch (Exception ex) {
            log.warn("Could not resolve avatar URL for media {}: {}", mediaId, ex.getMessage());
            return null;
        }
    }
}
