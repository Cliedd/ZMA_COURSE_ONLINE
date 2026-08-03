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
 * Verifies /api/v1/auth/users/count is a genuinely public marketing stat:
 * no authentication required, and it exposes only an aggregate count — no
 * per-user data.
 */
class UserStatsControllerIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Test
    void count_withoutAuthentication_returnsAggregateOnly() {
        createUserDirectly("student1@example.com", "STUDENT");
        createUserDirectly("student2@example.com", "STUDENT");
        createUserDirectly("teacher1@example.com", "TEACHER");

        ResponseEntity<Map> response =
                restTemplate.getForEntity("/api/v1/auth/users/count", Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody()).containsOnlyKeys("count");
        assertThat(((Number) response.getBody().get("count")).longValue()).isEqualTo(3);
    }

    @Test
    void count_withNoUsers_returnsZero() {
        ResponseEntity<Map> response =
                restTemplate.getForEntity("/api/v1/auth/users/count", Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(((Number) response.getBody().get("count")).longValue()).isEqualTo(0);
    }

    private User createUserDirectly(String email, String role) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("Password123!"));
        user.setRole(role);
        user.setProvider("LOCAL");
        user.setEmailVerified(true);
        user.setSuspended(false);
        return userRepository.save(user);
    }
}
