package com.ztf.zma.auth.api;

import com.ztf.zma.auth.domain.User;
import com.ztf.zma.auth.infrastructure.JwtUtils;
import com.ztf.zma.auth.support.AbstractIntegrationTest;
import com.warrenstrange.googleauth.GoogleAuthenticator;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * End-to-end tests for TOTP MFA setup and the MFA-gated login flow.
 */
class MfaIntegrationTest extends AbstractIntegrationTest {

    private static final int MFA_MAX_ATTEMPTS = 5;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtils jwtUtils;

    private final GoogleAuthenticator ga = new GoogleAuthenticator();

    // ── Setup ─────────────────────────────────────────────────────────────────

    @Test
    void mfaSetup_generatesSecretAndOtpUri_withoutEnablingMfaYet() {
        String accessToken = registerAndLogin("mfa-setup@example.com", "TEACHER");

        ResponseEntity<MfaSetupResponse> response = restTemplate.exchange(
                "/api/v1/auth/mfa/setup", HttpMethod.POST,
                authenticatedEntity(accessToken, null), MfaSetupResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        MfaSetupResponse body = response.getBody();
        assertThat(body).isNotNull();
        assertThat(body.secret()).isNotBlank();
        assertThat(body.otpAuthUri()).startsWith("otpauth://totp/");
        // '@' is percent-encoded (%40) in the URI path per RFC 3986 — decode before asserting.
        assertThat(java.net.URLDecoder.decode(body.otpAuthUri(), java.nio.charset.StandardCharsets.UTF_8))
                .contains("mfa-setup@example.com");
        assertThat(body.account()).isEqualTo("mfa-setup@example.com");

        User stored = userRepository.findByEmail("mfa-setup@example.com").orElseThrow();
        assertThat(stored.getMfaSecret()).isEqualTo(body.secret());
        assertThat(stored.isMfaEnabled()).isFalse();
    }

    @Test
    void mfaSetup_withoutAuthentication_isRejected() {
        ResponseEntity<Map> response = restTemplate.postForEntity(
                "/api/v1/auth/mfa/setup", null, Map.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }

    // ── Confirming setup ─────────────────────────────────────────────────────

    @Test
    void mfaVerify_withCorrectCode_confirmsSetupAndEnablesMfa() {
        String accessToken = registerAndLogin("mfa-confirm-ok@example.com", "ADMIN");
        String secret = doMfaSetup(accessToken);
        String validCode = String.valueOf(ga.getTotpPassword(secret));

        ResponseEntity<Map> response = restTemplate.exchange(
                "/api/v1/auth/mfa/verify", HttpMethod.POST,
                authenticatedEntity(accessToken, new MfaVerifyRequest(null, validCode)), Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("mfaEnabled", true);

        User stored = userRepository.findByEmail("mfa-confirm-ok@example.com").orElseThrow();
        assertThat(stored.isMfaEnabled()).isTrue();
    }

    @Test
    void mfaVerify_withWrongCode_doesNotEnableMfa() {
        String accessToken = registerAndLogin("mfa-confirm-bad@example.com", "ADMIN");
        doMfaSetup(accessToken);

        ResponseEntity<Map> response = restTemplate.exchange(
                "/api/v1/auth/mfa/verify", HttpMethod.POST,
                authenticatedEntity(accessToken, new MfaVerifyRequest(null, "000000")), Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);

        User stored = userRepository.findByEmail("mfa-confirm-bad@example.com").orElseThrow();
        assertThat(stored.isMfaEnabled()).isFalse();
    }

    // ── Login with MFA enabled ───────────────────────────────────────────────

    @Test
    void login_withMfaEnabled_returnsChallengeInsteadOfTokens() {
        String email = "mfa-login-challenge@example.com";
        String accessToken = registerAndLogin(email, "TEACHER");
        confirmMfa(accessToken, email);

        LoginRequest login = new LoginRequest(email, "correct-password-1");
        ResponseEntity<Map> response =
                restTemplate.postForEntity("/api/v1/auth/login", login, Map.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).containsEntry("mfaRequired", true);
        assertThat(response.getBody().get("challengeToken")).isNotNull();
        // No token pair leaked in this response.
        assertThat(response.getBody()).doesNotContainKey("token");
        assertThat(response.getBody()).doesNotContainKey("refreshToken");
    }

    @Test
    void mfaVerify_withValidChallengeAndCode_issuesRealTokens() {
        String email = "mfa-login-complete@example.com";
        String setupToken = registerAndLogin(email, "TEACHER");
        String secret = confirmMfa(setupToken, email);

        LoginRequest login = new LoginRequest(email, "correct-password-1");
        MfaChallengeResponse challenge =
                restTemplate.postForEntity("/api/v1/auth/login", login, MfaChallengeResponse.class).getBody();
        assertThat(challenge).isNotNull();
        assertThat(challenge.mfaRequired()).isTrue();

        String validCode = String.valueOf(ga.getTotpPassword(secret));
        ResponseEntity<AuthResponse> response = restTemplate.postForEntity(
                "/api/v1/auth/mfa/verify",
                new MfaVerifyRequest(challenge.challengeToken(), validCode),
                AuthResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        AuthResponse tokens = response.getBody();
        assertThat(tokens).isNotNull();
        assertThat(tokens.token()).isNotBlank();
        assertThat(tokens.refreshToken()).isNotBlank();
        assertThat(tokens.email()).isEqualTo(email);
        assertThat(jwtUtils.validateToken(tokens.token())).isTrue();
    }

    @Test
    void mfaVerify_loginStage_wrongCodeIsRateLimitedLikePasswordAttempts() {
        String email = "mfa-login-ratelimited@example.com";
        String setupToken = registerAndLogin(email, "TEACHER");
        String secret = confirmMfa(setupToken, email);

        LoginRequest login = new LoginRequest(email, "correct-password-1");
        MfaChallengeResponse challenge =
                restTemplate.postForEntity("/api/v1/auth/login", login, MfaChallengeResponse.class).getBody();
        assertThat(challenge).isNotNull();

        // First MFA_MAX_ATTEMPTS wrong codes: rejected as invalid, not rate-limited yet.
        for (int i = 0; i < MFA_MAX_ATTEMPTS; i++) {
            ResponseEntity<Map> response = restTemplate.postForEntity(
                    "/api/v1/auth/mfa/verify",
                    new MfaVerifyRequest(challenge.challengeToken(), "000000"),
                    Map.class);
            assertThat(response.getStatusCode())
                    .as("attempt #%d should be a normal invalid-code failure", i + 1)
                    .isEqualTo(HttpStatus.UNAUTHORIZED);
        }

        // Next attempt — even with the CORRECT code — must now be blocked.
        String validCode = String.valueOf(ga.getTotpPassword(secret));
        ResponseEntity<Map> blockedResponse = restTemplate.postForEntity(
                "/api/v1/auth/mfa/verify",
                new MfaVerifyRequest(challenge.challengeToken(), validCode),
                Map.class);

        assertThat(blockedResponse.getStatusCode()).isEqualTo(HttpStatus.TOO_MANY_REQUESTS);
    }

    // ── Non-MFA users unaffected ─────────────────────────────────────────────

    @Test
    void login_forNonMfaUser_stillReturnsTokensDirectly() {
        registerDirectly("mfa-untouched@example.com", "correct-password-1", "STUDENT");

        LoginRequest login = new LoginRequest("mfa-untouched@example.com", "correct-password-1");
        ResponseEntity<AuthResponse> response =
                restTemplate.postForEntity("/api/v1/auth/login", login, AuthResponse.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().token()).isNotBlank();
        assertThat(response.getBody().refreshToken()).isNotBlank();
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    /** Registers a user directly (bypassing the STUDENT/TEACHER-only /register restriction so
     *  ADMIN accounts can be exercised too) and logs in, returning a fresh access token. */
    private String registerAndLogin(String email, String role) {
        registerDirectly(email, "correct-password-1", role);
        LoginRequest login = new LoginRequest(email, "correct-password-1");
        AuthResponse tokens = restTemplate.postForEntity(
                "/api/v1/auth/login", login, AuthResponse.class).getBody();
        assertThat(tokens).isNotNull();
        return tokens.token();
    }

    private User registerDirectly(String email, String rawPassword, String role) {
        User user = new User();
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setProvider("LOCAL");
        user.setEmailVerified(true);
        return userRepository.save(user);
    }

    private String doMfaSetup(String accessToken) {
        ResponseEntity<MfaSetupResponse> response = restTemplate.exchange(
                "/api/v1/auth/mfa/setup", HttpMethod.POST,
                authenticatedEntity(accessToken, null), MfaSetupResponse.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        return response.getBody().secret();
    }

    /** Runs /mfa/setup + confirms it with a valid code, returning the confirmed secret. */
    private String confirmMfa(String accessToken, String email) {
        String secret = doMfaSetup(accessToken);
        String validCode = String.valueOf(ga.getTotpPassword(secret));
        ResponseEntity<Map> response = restTemplate.exchange(
                "/api/v1/auth/mfa/verify", HttpMethod.POST,
                authenticatedEntity(accessToken, new MfaVerifyRequest(null, validCode)), Map.class);
        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.OK);
        return secret;
    }

    private <T> HttpEntity<T> authenticatedEntity(String accessToken, T body) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(accessToken);
        return new HttpEntity<>(body, headers);
    }
}
