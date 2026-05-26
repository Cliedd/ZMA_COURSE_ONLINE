package com.ztf.zma.auth.infrastructure;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Notifies zma-users of a new account so it can create the user profile.
 * Fire-and-forget: failures are logged but do not abort registration.
 */
@Component
public class UsersServiceClient {

    private static final Logger log = LoggerFactory.getLogger(UsersServiceClient.class);

    private final RestClient restClient;

    public UsersServiceClient(@Value("${users.service.url:http://zma-users:8082}") String baseUrl) {
        this.restClient = RestClient.builder()
            .baseUrl(baseUrl)
            .build();
    }

    public void notifyUserCreated(String userId, String email, String role) {
        try {
            restClient.post()
                .uri("/api/v1/users/internal/create")
                .contentType(MediaType.APPLICATION_JSON)
                .body(Map.of("id", userId, "email", email, "role", role))
                .retrieve()
                .toBodilessEntity();
        } catch (Exception e) {
            log.warn("Could not notify zma-users of new account [{}]: {}", email, e.getMessage());
        }
    }
}
