package com.ztf.zma.gateway;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.client.RestTemplate;

import java.net.URI;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Regression tests for the identity-header spoofing fix in {@link GatewayRouter}.
 *
 * The gateway is the only component allowed to set X-User-Email / X-User-Role
 * on the request forwarded to downstream services — those headers carry a
 * trust decision (the caller's validated identity) that downstream services
 * rely on without re-checking the JWT themselves.
 */
class GatewayIdentityHeaderFilterTest {

    private TestJwtUtils jwtUtils;
    private TestRateLimiter rateLimiter;
    private TestRestTemplate restTemplate;
    private GatewayRouter router;

    static class TestJwtUtils extends JwtUtils {
        boolean valid = false;
        String email = null;
        String role = null;

        @Override
        public boolean validateToken(String token) {
            return valid;
        }

        @Override
        public String getEmailFromToken(String token) {
            return email;
        }

        @Override
        public String getRoleFromToken(String token) {
            return role;
        }
    }

    static class TestRateLimiter extends GatewayRateLimiter {
        public TestRateLimiter() {
            super(null);
        }

        @Override
        public boolean isRateLimited(String ip) {
            return false;
        }
    }

    static class TestRestTemplate extends RestTemplate {
        HttpEntity<?> lastEntity;

        @Override
        @SuppressWarnings("unchecked")
        public <T> ResponseEntity<T> exchange(URI url, HttpMethod method, HttpEntity<?> requestEntity, Class<T> responseType) {
            this.lastEntity = requestEntity;
            return (ResponseEntity<T>) new ResponseEntity<>("{}", HttpStatus.OK);
        }
    }

    @BeforeEach
    void setUp() {
        jwtUtils = new TestJwtUtils();
        rateLimiter = new TestRateLimiter();
        restTemplate = new TestRestTemplate();

        router = new GatewayRouter(jwtUtils, rateLimiter);
        ReflectionTestUtils.setField(router, "restTemplate", restTemplate);
        ReflectionTestUtils.setField(router, "authUrl", "http://downstream-auth");
    }

    private HttpHeaders forwardedHeaders(MockHttpServletRequest request) {
        router.proxyAuth(request, null);
        return restTemplate.lastEntity != null ? restTemplate.lastEntity.getHeaders() : new HttpHeaders();
    }

    @Test
    void spoofedRoleHeaderIsStrippedWhenNoJwtIsPresent() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/auth/whoami");
        request.addHeader("X-User-Role", "ADMIN");
        request.addHeader("X-User-Email", "attacker@evil.com");

        HttpHeaders forwarded = forwardedHeaders(request);

        assertThat(forwarded.get("X-User-Role")).isNull();
        assertThat(forwarded.get("X-User-Email")).isNull();
    }

    @Test
    void spoofedRoleHeaderCannotOverrideTheJwtDerivedRole() {
        jwtUtils.valid = true;
        jwtUtils.email = "student@zma.com";
        jwtUtils.role = "STUDENT";

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/auth/whoami");
        request.addHeader("Authorization", "Bearer valid-token");
        request.addHeader("X-User-Role", "ADMIN");
        request.addHeader("X-User-Email", "attacker@evil.com");

        HttpHeaders forwarded = forwardedHeaders(request);

        assertThat(forwarded.getFirst("X-User-Role")).isEqualTo("STUDENT");
        assertThat(forwarded.getFirst("X-User-Email")).isEqualTo("student@zma.com");
    }

    @Test
    void invalidJwtDoesNotLeaveSpoofedHeadersInPlace() {
        jwtUtils.valid = false;

        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/auth/whoami");
        request.addHeader("Authorization", "Bearer bad-token");
        request.addHeader("X-User-Role", "ADMIN");

        HttpHeaders forwarded = forwardedHeaders(request);

        assertThat(forwarded.get("X-User-Role")).isNull();
    }
}
