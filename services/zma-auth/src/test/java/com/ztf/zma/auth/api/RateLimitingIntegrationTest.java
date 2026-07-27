package com.ztf.zma.auth.api;

import com.ztf.zma.auth.domain.User;
import com.ztf.zma.auth.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifies the Redis-backed login rate limiter (LOGIN_MAX_ATTEMPTS = 5 per
 * 10-minute window, keyed by client IP) actually blocks repeated failed
 * attempts.
 */
class RateLimitingIntegrationTest extends AbstractIntegrationTest {

    private static final int LOGIN_MAX_ATTEMPTS = 5;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void repeatedFailedLogins_areBlockedAfterMaxAttempts() {
        User user = new User();
        user.setEmail("ratelimited@example.com");
        user.setPassword(passwordEncoder.encode("correct-password-1"));
        user.setRole("STUDENT");
        user.setProvider("LOCAL");
        user.setEmailVerified(true);
        userRepository.save(user);

        LoginRequest badLogin = new LoginRequest("ratelimited@example.com", "wrong-password");

        // First LOGIN_MAX_ATTEMPTS failed attempts: rejected for bad credentials.
        for (int i = 0; i < LOGIN_MAX_ATTEMPTS; i++) {
            ResponseEntity<Map> response =
                    restTemplate.postForEntity("/api/v1/auth/login", badLogin, Map.class);
            assertThat(response.getStatusCode())
                    .as("attempt #%d should be a normal credential failure", i + 1)
                    .isEqualTo(HttpStatus.UNAUTHORIZED);
        }

        // The next attempt — even with the CORRECT password — must be blocked by the rate limiter.
        LoginRequest correctLogin = new LoginRequest("ratelimited@example.com", "correct-password-1");
        ResponseEntity<Map> blockedResponse =
                restTemplate.postForEntity("/api/v1/auth/login", correctLogin, Map.class);

        assertThat(blockedResponse.getStatusCode()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
        assertThat(blockedResponse.getBody())
                .containsEntry("message", "Too many login attempts. Try again in 10 minutes.");
    }
}
