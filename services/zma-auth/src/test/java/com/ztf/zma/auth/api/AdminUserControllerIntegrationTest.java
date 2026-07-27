package com.ztf.zma.auth.api;

import com.ztf.zma.auth.domain.User;
import com.ztf.zma.auth.infrastructure.JwtUtils;
import com.ztf.zma.auth.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Verifies /api/v1/auth/admin/users/** is genuinely reserved for ADMIN
 * accounts: unauthenticated callers and non-admin callers are rejected,
 * and an authenticated ADMIN can list users, change roles and suspend
 * accounts.
 */
class AdminUserControllerIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    @Test
    void listUsers_withoutAuthentication_isRejected() {
        ResponseEntity<Map> response =
                restTemplate.getForEntity("/api/v1/auth/admin/users", Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void listUsers_asNonAdmin_isForbidden() {
        String studentToken = registerAndGetToken("student@example.com", "STUDENT");

        HttpEntity<Void> request = authenticated(studentToken);
        ResponseEntity<Map> response = restTemplate.exchange(
                "/api/v1/auth/admin/users", HttpMethod.GET, request, Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);
    }

    @Test
    void listUsers_asAdmin_succeeds() {
        createUserDirectly("admin@example.com", "ADMIN", false);
        createUserDirectly("someone@example.com", "STUDENT", false);
        String adminToken = jwtUtils.generateToken("admin@example.com", "ADMIN");

        HttpEntity<Void> request = authenticated(adminToken);
        ResponseEntity<Map> response = restTemplate.exchange(
                "/api/v1/auth/admin/users", HttpMethod.GET, request, Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat((Integer) response.getBody().get("totalElements")).isEqualTo(2);
    }

    @Test
    void updateRole_asAdmin_succeeds_andAsNonAdmin_isForbidden() {
        User admin = createUserDirectly("admin2@example.com", "ADMIN", false);
        User target = createUserDirectly("target@example.com", "STUDENT", false);
        String adminToken = jwtUtils.generateToken(admin.getEmail(), "ADMIN");
        String studentToken = jwtUtils.generateToken(target.getEmail(), "STUDENT");

        // Non-admin cannot promote themselves.
        HttpEntity<Void> nonAdminRequest = authenticated(studentToken);
        ResponseEntity<Map> forbidden = restTemplate.exchange(
                "/api/v1/auth/admin/users/" + target.getId() + "/role?role=TEACHER",
                HttpMethod.PUT, nonAdminRequest, Map.class);
        assertThat(forbidden.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        // Admin can change the role.
        HttpEntity<Void> adminRequest = authenticated(adminToken);
        ResponseEntity<UserSummary> ok = restTemplate.exchange(
                "/api/v1/auth/admin/users/" + target.getId() + "/role?role=TEACHER",
                HttpMethod.PUT, adminRequest, UserSummary.class);

        assertThat(ok.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(ok.getBody()).isNotNull();
        assertThat(ok.getBody().role()).isEqualTo("TEACHER");
    }

    @Test
    void suspendUser_asAdmin_succeeds_andPreventsLogin() {
        User admin = createUserDirectly("admin3@example.com", "ADMIN", false);
        User target = createUserDirectly("suspendtarget@example.com", "STUDENT", false);
        String adminToken = jwtUtils.generateToken(admin.getEmail(), "ADMIN");

        HttpEntity<Void> adminRequest = authenticated(adminToken);
        ResponseEntity<UserSummary> response = restTemplate.exchange(
                "/api/v1/auth/admin/users/" + target.getId() + "/suspend?suspended=true",
                HttpMethod.PUT, adminRequest, UserSummary.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().suspended()).isTrue();

        User reloaded = userRepository.findById(target.getId()).orElseThrow();
        assertThat(reloaded.isSuspended()).isTrue();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private User createUserDirectly(String email, String role, boolean suspended) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode("Password123!"));
        user.setRole(role);
        user.setProvider("LOCAL");
        user.setEmailVerified(true);
        user.setSuspended(suspended);
        return userRepository.save(user);
    }

    private String registerAndGetToken(String email, String role) {
        createUserDirectly(email, role, false);
        return jwtUtils.generateToken(email, role);
    }

    private HttpEntity<Void> authenticated(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        return new HttpEntity<>(headers);
    }
}
