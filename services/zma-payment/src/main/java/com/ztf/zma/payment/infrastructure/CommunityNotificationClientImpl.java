package com.ztf.zma.payment.infrastructure;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Fire-and-forget client to zma-community for payment-confirmation notifications.
 *
 * Mirrors EnrollmentClientImpl's resilience contract: a notification failure
 * must never break payment confirmation, so every failure is caught and logged.
 */
@Component
public class CommunityNotificationClientImpl implements CommunityNotificationClient {

    private static final Logger log = LoggerFactory.getLogger(CommunityNotificationClientImpl.class);

    private final RestClient restClient;

    public CommunityNotificationClientImpl(
            @Value("${community.service.url:http://zma-community:8087}") String communityUrl) {
        this.restClient = RestClient.builder().baseUrl(communityUrl).build();
    }

    @Override
    public void notifyPaymentConfirmed(String studentId, String courseTitle) {
        try {
            restClient.post()
                .uri("/api/v1/notifications/internal/notify")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of(
                    "userId", studentId,
                    "message", "Your payment for \"" + (courseTitle != null ? courseTitle : "your course")
                        + "\" was confirmed."
                ))
                .retrieve()
                .toBodilessEntity();
            log.info("Payment-confirmation notification sent for student={}", studentId);
        } catch (Exception e) {
            log.warn("Could not send payment-confirmation notification to user {}: {}",
                     studentId, e.getMessage());
        }
    }
}
