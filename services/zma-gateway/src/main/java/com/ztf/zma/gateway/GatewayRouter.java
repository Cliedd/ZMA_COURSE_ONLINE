package com.ztf.zma.gateway;

import io.github.resilience4j.circuitbreaker.CallNotPermittedException;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import jakarta.servlet.http.HttpServletRequest;
import org.apache.hc.client5.http.classic.HttpClient;
import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.util.StreamUtils;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.io.IOException;
import java.net.URI;
import java.util.Enumeration;
import java.util.Map;
import java.util.Set;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Reverse-proxy with:
 *  - JWT validation → injects X-User-Email, X-User-Role headers
 *  - X-Request-Id correlation ID on every request
 *  - Per-IP rate limiting (Redis)
 *  - Resilience4j circuit breakers per downstream service
 *  - Structured request logging
 */
@RestController
@RequestMapping("/api/v1")
public class GatewayRouter {

    private static final Logger log = LoggerFactory.getLogger(GatewayRouter.class);

    private final RestTemplate       restTemplate;
    private final JwtUtils           jwtUtils;
    private final GatewayRateLimiter rateLimiter;

    @Value("${gateway.auth-service.url}")       private String authUrl;
    @Value("${gateway.users-service.url}")      private String usersUrl;
    @Value("${gateway.catalog-service.url}")    private String catalogUrl;
    @Value("${gateway.media-service.url}")      private String mediaUrl;
    @Value("${gateway.enrollment-service.url}") private String enrollmentUrl;
    @Value("${gateway.payment-service.url}")    private String paymentUrl;
    @Value("${gateway.community-service.url}")  private String communityUrl;

    /** Routes that don't require a valid JWT to pass through */
    private static final Set<String> PUBLIC_PREFIXES = Set.of(
        "/api/v1/auth/register",
        "/api/v1/auth/login",
        "/api/v1/auth/refresh",
        "/api/v1/auth/forgot-password",
        "/api/v1/auth/reset-password",
        "/api/v1/auth/verify-email"
    );

    public GatewayRouter(JwtUtils jwtUtils, GatewayRateLimiter rateLimiter) {
        this.jwtUtils    = jwtUtils;
        this.rateLimiter = rateLimiter;
        // Use Apache HttpComponents to support all HTTP methods including PATCH
        // Long timeouts for large file uploads
        HttpClient httpClient = HttpClients.custom()
            .setDefaultRequestConfig(RequestConfig.custom()
                .setResponseTimeout(600, TimeUnit.SECONDS)
                .setConnectionRequestTimeout(30, TimeUnit.SECONDS)
                .build())
            .build();
        HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory(httpClient);
        factory.setBufferRequestBody(false); // stream request body, don't buffer in memory
        this.restTemplate = new RestTemplate(factory);
    }

    // ── Route handlers ────────────────────────────────────────────────────────

    @RequestMapping(value = "/auth/**",
        method = {RequestMethod.GET, RequestMethod.POST,
                  RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
    @CircuitBreaker(name = "auth", fallbackMethod = "fallback")
    public ResponseEntity<String> proxyAuth(HttpServletRequest req,
                                            @RequestBody(required = false) String body) {
        return proxy(req, body, authUrl, false);
    }

    @RequestMapping(value = "/users/**",
        method = {RequestMethod.GET, RequestMethod.POST,
                  RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
    @CircuitBreaker(name = "users", fallbackMethod = "fallback")
    public ResponseEntity<String> proxyUsers(HttpServletRequest req,
                                             @RequestBody(required = false) String body) {
        return proxy(req, body, usersUrl, true);
    }

    @RequestMapping(value = "/courses/**",
        method = {RequestMethod.GET, RequestMethod.POST,
                  RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
    @CircuitBreaker(name = "catalog", fallbackMethod = "fallback")
    public ResponseEntity<String> proxyCatalog(HttpServletRequest req,
                                               @RequestBody(required = false) String body) {
        return proxy(req, body, catalogUrl, false);
    }

    @RequestMapping(value = "/media/**",
        method = {RequestMethod.GET, RequestMethod.POST,
                  RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
    @CircuitBreaker(name = "media", fallbackMethod = "fallbackBytes")
    public ResponseEntity<byte[]> proxyMedia(HttpServletRequest req) throws IOException {
        return proxyBytes(req, mediaUrl, false);
    }

    @RequestMapping(value = {"/enrollments/**", "/certificates/**"},
        method = {RequestMethod.GET, RequestMethod.POST,
                  RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
    @CircuitBreaker(name = "enrollment", fallbackMethod = "fallback")
    public ResponseEntity<String> proxyEnrollment(HttpServletRequest req,
                                                  @RequestBody(required = false) String body) {
        return proxy(req, body, enrollmentUrl, true);
    }

    @RequestMapping(value = "/payments/**",
        method = {RequestMethod.GET, RequestMethod.POST,
                  RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
    @CircuitBreaker(name = "payment", fallbackMethod = "fallback")
    public ResponseEntity<String> proxyPayment(HttpServletRequest req,
                                               @RequestBody(required = false) String body) {
        return proxy(req, body, paymentUrl, true);
    }

    @RequestMapping(value = {"/community/**", "/notifications/**"},
        method = {RequestMethod.GET, RequestMethod.POST,
                  RequestMethod.PUT, RequestMethod.PATCH, RequestMethod.DELETE})
    @CircuitBreaker(name = "community", fallbackMethod = "fallback")
    public ResponseEntity<String> proxyCommunity(HttpServletRequest req,
                                                 @RequestBody(required = false) String body) {
        return proxy(req, body, communityUrl, false);
    }

    // ── Circuit breaker fallback ──────────────────────────────────────────────

    public ResponseEntity<String> fallback(HttpServletRequest req, String body,
                                           CallNotPermittedException ex) {
        log.warn("Circuit open for {}: {}", req.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
            .body("{\"error\":\"Service temporarily unavailable. Please try again shortly.\"}");
    }

    public ResponseEntity<String> fallback(HttpServletRequest req, String body,
                                           ResourceAccessException ex) {
        log.warn("Service unreachable for {}: {}", req.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
            .body("{\"error\":\"Service temporarily unavailable.\"}");
    }

    public ResponseEntity<byte[]> fallbackBytes(HttpServletRequest req,
                                                CallNotPermittedException ex) {
        log.warn("Circuit open for {}: {}", req.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
            .body("{\"error\":\"Service temporarily unavailable.\"}".getBytes());
    }

    public ResponseEntity<byte[]> fallbackBytes(HttpServletRequest req,
                                                ResourceAccessException ex) {
        log.warn("Service unreachable for {}: {}", req.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
            .body("{\"error\":\"Service temporarily unavailable.\"}".getBytes());
    }

    public ResponseEntity<byte[]> fallbackBytes(HttpServletRequest req, IOException ex) {
        log.warn("IO error for {}: {}", req.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
            .body("{\"error\":\"Gateway IO error.\"}".getBytes());
    }

    // ── Core proxy logic ──────────────────────────────────────────────────────

    private static final Set<String> HOP_BY_HOP = Set.of(
        "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
        "te", "trailers", "transfer-encoding", "upgrade",
        "host", "content-length"
    );

    /**
     * Headers that only the gateway itself is allowed to set — they carry
     * trust decisions (identity, role) that downstream services rely on
     * without re-validating the JWT. They MUST be stripped from the
     * incoming client request before being (re)populated below, otherwise
     * a client could spoof e.g. "X-User-Role: ADMIN" directly and have it
     * forwarded untouched whenever no valid JWT is present.
     */
    private static final Set<String> IDENTITY_HEADERS = Set.of(
        "x-user-email", "x-user-role"
    );

    private ResponseEntity<String> proxy(HttpServletRequest request,
                                         String body,
                                         String targetBase,
                                         boolean requireAuth) {
        long start = System.currentTimeMillis();
        String requestId = UUID.randomUUID().toString();
        String path = request.getRequestURI();
        String ip   = getClientIp(request);

        // ── Rate limiting ──────────────────────────────────────────────────
        if (rateLimiter.isRateLimited(ip)) {
            log.warn("[{}] Rate limit exceeded for IP={} path={}", requestId, ip, path);
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .header("Retry-After", "60")
                .body("{\"error\":\"Too many requests. Slow down.\"}");
        }

        // ── Build outgoing headers ─────────────────────────────────────────
        HttpHeaders headers = new HttpHeaders();
        Enumeration<String> names = request.getHeaderNames();
        while (names.hasMoreElements()) {
            String name = names.nextElement();
            // IDENTITY_HEADERS excluded here too: on a public/unauthenticated
            // route the JWT block below never runs, so without this exclusion
            // a client-supplied X-User-Role would pass through unchanged.
            if (!HOP_BY_HOP.contains(name.toLowerCase()) && !IDENTITY_HEADERS.contains(name.toLowerCase())) {
                headers.set(name, request.getHeader(name));
            }
        }

        // Propagate correlation ID
        headers.set("X-Request-Id", requestId);

        // ── JWT extraction + user header injection ─────────────────────────
        String authHeader = request.getHeader("Authorization");
        String userEmail  = null;
        String userRole   = null;

        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtils.validateToken(token)) {
                userEmail = jwtUtils.getEmailFromToken(token);
                userRole  = jwtUtils.getRoleFromToken(token);
                headers.set("X-User-Email", userEmail);
                headers.set("X-User-Role",  userRole);
            }
        }

        // ── Auth check for protected routes ───────────────────────────────
        boolean isPublic = PUBLIC_PREFIXES.stream().anyMatch(path::startsWith)
            || (path.startsWith("/api/v1/courses") && !path.startsWith("/api/v1/courses/admin") && "GET".equals(request.getMethod()))
            || (path.startsWith("/api/v1/community") && "GET".equals(request.getMethod()))
            || path.startsWith("/api/v1/payments/webhook");

        if (requireAuth && !isPublic && userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("{\"error\":\"Authentication required\"}");
        }

        // ── Forward request ───────────────────────────────────────────────
        String queryString = request.getQueryString();
        String targetUrl   = targetBase + path + (queryString != null ? "?" + queryString : "");
        HttpMethod method  = HttpMethod.valueOf(request.getMethod());
        HttpEntity<String> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> upstream = restTemplate.exchange(
                URI.create(targetUrl), method, entity, String.class);

            HttpHeaders respHeaders = new HttpHeaders();
            upstream.getHeaders().forEach((name, values) -> {
                if (!HOP_BY_HOP.contains(name.toLowerCase())) {
                    respHeaders.put(name, values);
                }
            });
            respHeaders.set("X-Request-Id", requestId);

            long ms = System.currentTimeMillis() - start;
            log.info("[{}] {} {} → {} {}ms user={}", requestId, method, path,
                     upstream.getStatusCode().value(), ms,
                     userEmail != null ? userEmail : "anonymous");

            return ResponseEntity.status(upstream.getStatusCode())
                    .headers(respHeaders)
                    .body(upstream.getBody());

        } catch (HttpStatusCodeException ex) {
            long ms = System.currentTimeMillis() - start;
            log.warn("[{}] {} {} → {} {}ms", requestId, method, path,
                     ex.getStatusCode().value(), ms);
            return ResponseEntity.status(ex.getStatusCode())
                    .body(ex.getResponseBodyAsString());
        }
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (StringUtils.hasText(xff)) return xff.split(",")[0].trim();
        return request.getRemoteAddr();
    }

    /**
     * Binary-safe proxy — reads request body as raw bytes so multipart/form-data
     * (video uploads) is not corrupted when forwarded.
     */
    private ResponseEntity<byte[]> proxyBytes(HttpServletRequest request,
                                               String targetBase,
                                               boolean requireAuth) throws IOException {
        long start = System.currentTimeMillis();
        String requestId = UUID.randomUUID().toString();
        String path = request.getRequestURI();
        String ip   = getClientIp(request);

        if (rateLimiter.isRateLimited(ip)) {
            return ResponseEntity.status(HttpStatus.TOO_MANY_REQUESTS)
                .body("{\"error\":\"Too many requests.\"}".getBytes());
        }

        HttpHeaders headers = new HttpHeaders();
        Enumeration<String> names = request.getHeaderNames();
        while (names.hasMoreElements()) {
            String name = names.nextElement();
            if (!HOP_BY_HOP.contains(name.toLowerCase()) && !IDENTITY_HEADERS.contains(name.toLowerCase())) {
                headers.set(name, request.getHeader(name));
            }
        }
        headers.set("X-Request-Id", requestId);

        String authHeader = request.getHeader("Authorization");
        String userEmail  = null;
        String userRole   = null;
        if (StringUtils.hasText(authHeader) && authHeader.startsWith("Bearer ")) {
            String token = authHeader.substring(7);
            if (jwtUtils.validateToken(token)) {
                userEmail = jwtUtils.getEmailFromToken(token);
                userRole  = jwtUtils.getRoleFromToken(token);
                headers.set("X-User-Email", userEmail);
                headers.set("X-User-Role",  userRole);
            }
        }

        boolean isPublic = (path.startsWith("/api/v1/media") && "GET".equals(request.getMethod()));
        if (requireAuth && !isPublic && userEmail == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body("{\"error\":\"Authentication required\"}".getBytes());
        }

        byte[] body = StreamUtils.copyToByteArray(request.getInputStream());
        String queryString = request.getQueryString();
        String targetUrl   = targetBase + path + (queryString != null ? "?" + queryString : "");
        HttpMethod method  = HttpMethod.valueOf(request.getMethod());
        HttpEntity<byte[]> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<byte[]> upstream = restTemplate.exchange(
                URI.create(targetUrl), method, entity, byte[].class);

            HttpHeaders respHeaders = new HttpHeaders();
            upstream.getHeaders().forEach((name, values) -> {
                if (!HOP_BY_HOP.contains(name.toLowerCase())) {
                    respHeaders.put(name, values);
                }
            });
            respHeaders.set("X-Request-Id", requestId);

            long ms = System.currentTimeMillis() - start;
            log.info("[{}] {} {} → {} {}ms user={}", requestId, method, path,
                     upstream.getStatusCode().value(), ms,
                     userEmail != null ? userEmail : "anonymous");

            return ResponseEntity.status(upstream.getStatusCode())
                    .headers(respHeaders)
                    .body(upstream.getBody());

        } catch (HttpStatusCodeException ex) {
            long ms = System.currentTimeMillis() - start;
            log.warn("[{}] {} {} → {} {}ms", requestId, method, path,
                     ex.getStatusCode().value(), ms);
            return ResponseEntity.status(ex.getStatusCode())
                    .body(ex.getResponseBodyAsByteArray());
        }
    }
}
