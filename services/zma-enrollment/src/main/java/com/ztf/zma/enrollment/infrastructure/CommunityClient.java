package com.ztf.zma.enrollment.infrastructure;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Fire-and-forget client to zma-community for enrollment notifications.
 */
@Component
public class CommunityClient {

    private static final Logger log = LoggerFactory.getLogger(CommunityClient.class);

    private final RestClient restClient;

    public CommunityClient(
            @Value("${community.service.url:http://zma-community:8087}") String communityUrl) {
        this.restClient = RestClient.builder()
                .baseUrl(communityUrl)
                .build();
    }

    public void notifyEnrollment(String studentId, String courseTitle) {
        try {
            restClient.post()
                .uri("/api/v1/notifications/internal/notify")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                    "userId", studentId,
                    "message", "You have been enrolled in: " + courseTitle
                ))
                .retrieve()
                .toBodilessEntity();
        } catch (Exception ex) {
            log.warn("Could not send enrollment notification to user {}: {}", studentId, ex.getMessage());
        }
    }
}
