package com.ztf.zma.auth.api;

import com.ztf.zma.auth.domain.User;
import com.ztf.zma.auth.infrastructure.JwtUtils;
import com.ztf.zma.auth.support.AbstractIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * End-to-end tests for register / login / refresh, running against real
 * PostgreSQL + Redis Testcontainers.
 */
class AuthFlowIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    // ── Register ─────────────────────────────────────────────────────────────

    @Test
    void register_thenLoginWithWrongPassword_isRejected() {
        RegisterRequest register = new RegisterRequest("wrongpass@example.com", "correct-password-1", "STUDENT");
        ResponseEntity<AuthResponse> registerResponse =
                restTemplate.postForEntity("/api/v1/auth/register", register, AuthResponse.class);

        assertThat(registerResponse.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(registerResponse.getBody()).isNotNull();
        assertThat(registerResponse.getBody().token()).isNotBlank();

        LoginRequest badLogin = new LoginRequest("wrongpass@example.com", "totally-wrong-password");
        ResponseEntity<Map> loginResponse =
                restTemplate.postForEntity("/api/v1/auth/login", badLogin, Map.class);

        assertThat(loginResponse.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(loginResponse.getBody()).containsEntry("message", "Invalid credentials");
    }

    // ── Login (happy path) ───────────────────────────────────────────────────

    @Test
    void login_withValidCredentials_returnsValidJwt() {
        registerDirectly("valid-login@example.com", "correct-password-1", "STUDENT", false);

        LoginRequest login = new LoginRequest("valid-login@example.com", "correct-password-1");
        ResponseEntity<AuthResponse> response =
                restTemplate.postForEntity("/api/v1/auth/login", login, AuthResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        AuthResponse body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.token()).isNotBlank();
        assertThat(body.refreshToken()).isNotBlank();
        assertThat(body.email()).isEqualTo("valid-login@example.com");
        assertThat(body.role()).isEqualTo("STUDENT");

        // Token really is a valid, verifiable JWT for this user
        assertThat(jwtUtils.validateToken(body.token())).isTrue();
        assertThat(jwtUtils.getEmailFromToken(body.token())).isEqualTo("valid-login@example.com");
    }

    // ── Suspended account ────────────────────────────────────────────────────

    @Test
    void login_withSuspendedAccount_isRejected() {
        registerDirectly("suspended@example.com", "correct-password-1", "STUDENT", true);

        LoginRequest login = new LoginRequest("suspended@example.com", "correct-password-1");
        ResponseEntity<Map> response =
                restTemplate.postForEntity("/api/v1/auth/login", login, Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).containsEntry("message", "Account is suspended");
    }

    @Test
    void refresh_forAccountSuspendedAfterTokenIssued_isRejectedAndTokenRevoked() {
        User user = registerDirectly("suspend-after-login@example.com", "correct-password-1", "STUDENT", false);

        // Log in while the account is still active to obtain a refresh token.
        LoginRequest login = new LoginRequest("suspend-after-login@example.com", "correct-password-1");
        ResponseEntity<AuthResponse> loginResponse =
                restTemplate.postForEntity("/api/v1/auth/login", login, AuthResponse.class);
        assertThat(loginResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        String refreshToken = loginResponse.getBody().refreshToken();

        // Suspend the account after the token was issued.
        user.setSuspended(true);
        userRepository.save(user);

        RefreshRequest refreshRequest = new RefreshRequest(refreshToken);
        ResponseEntity<Map> refreshResponse =
                restTemplate.postForEntity("/api/v1/auth/refresh", refreshRequest, Map.class);

        assertThat(refreshResponse.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(refreshResponse.getBody()).containsEntry("message", "Account is suspended");

        // The refresh token must have been revoked — a second attempt is now "invalid token", not "suspended".
        ResponseEntity<Map> secondAttempt =
                restTemplate.postForEntity("/api/v1/auth/refresh", refreshRequest, Map.class);
        assertThat(secondAttempt.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(secondAttempt.getBody()).containsEntry("message", "Invalid or expired refresh token");
    }

    // ── Refresh ───────────────────────────────────────────────────────────────

    @Test
    void refresh_withValidToken_issuesNewTokenPair_thenOldRefreshTokenIsInvalid() {
        registerDirectly("refresh-ok@example.com", "correct-password-1", "STUDENT", false);
        LoginRequest login = new LoginRequest("refresh-ok@example.com", "correct-password-1");
        ResponseEntity<AuthResponse> loginResponse =
                restTemplate.postForEntity("/api/v1/auth/login", login, AuthResponse.class);
        String originalRefreshToken = loginResponse.getBody().refreshToken();

        RefreshRequest refreshRequest = new RefreshRequest(originalRefreshToken);
        ResponseEntity<AuthResponse> refreshResponse =
                restTemplate.postForEntity("/api/v1/auth/refresh", refreshRequest, AuthResponse.class);

        assertThat(refreshResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        AuthResponse refreshed = refreshResponse.getBody();
        assertThat(refreshed).isNotNull();
        assertThat(refreshed.token()).isNotBlank();
        assertThat(refreshed.refreshToken()).isNotBlank().isNotEqualTo(originalRefreshToken);

        // Old refresh token is single-use — reusing it must now fail.
        ResponseEntity<Map> reuseResponse =
                restTemplate.postForEntity("/api/v1/auth/refresh", refreshRequest, Map.class);
        assertThat(reuseResponse.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    @Test
    void refresh_withInvalidToken_isRejected() {
        RefreshRequest refreshRequest = new RefreshRequest("not-a-real-refresh-token");
        ResponseEntity<Map> response =
                restTemplate.postForEntity("/api/v1/auth/refresh", refreshRequest, Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        assertThat(response.getBody()).containsEntry("message", "Invalid or expired refresh token");
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private User registerDirectly(String email, String rawPassword, String role, boolean suspended) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setProvider("LOCAL");
        user.setEmailVerified(true);
        user.setSuspended(suspended);
        return userRepository.save(user);
    }
}
