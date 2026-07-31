package com.ztf.zma.gateway;

import jakarta.servlet.http.HttpServletRequest;
import org.apache.hc.client5.http.classic.HttpClient;
import org.apache.hc.client5.http.config.RequestConfig;
import org.apache.hc.client5.http.impl.classic.HttpClients;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.client.HttpComponentsClientHttpRequestFactory;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.HttpStatusCodeException;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.util.Enumeration;
import java.util.Set;
import java.util.concurrent.TimeUnit;

/**
 * Proxies Google OAuth2 login (/oauth2/authorization/google and the
 * /login/oauth2/code/google callback) to zma-auth, which is where Spring
 * Security's oauth2Login filter chain actually lives — GatewayRouter only
 * proxies /api/v1/**, so without this these paths 404 at the gateway
 * before ever reaching zma-auth.
 *
 * Both legs are HTTP redirects (302 to accounts.google.com, then 302 back
 * to the frontend once zma-auth completes the exchange) and must be
 * forwarded as-is — NOT auto-followed by the proxy's HTTP client — so the
 * browser itself performs each hop. This is also why the shared HttpClient
 * disables redirect following.
 */
@RestController
public class OAuth2ProxyController {

    private static final Logger log = LoggerFactory.getLogger(OAuth2ProxyController.class);

    private final RestTemplate restTemplate;

    @Value("${gateway.auth-service.url}")
    private String authUrl;

    private static final Set<String> HOP_BY_HOP = Set.of(
        "connection", "keep-alive", "proxy-authenticate", "proxy-authorization",
        "te", "trailers", "transfer-encoding", "upgrade",
        "host", "content-length"
    );

    public OAuth2ProxyController() {
        HttpClient httpClient = HttpClients.custom()
            .disableRedirectHandling()
            .setDefaultRequestConfig(RequestConfig.custom()
                .setConnectTimeout(10, TimeUnit.SECONDS)
                .setResponseTimeout(30, TimeUnit.SECONDS)
                .build())
            .build();
        HttpComponentsClientHttpRequestFactory factory = new HttpComponentsClientHttpRequestFactory(httpClient);
        this.restTemplate = new RestTemplate(factory);
    }

    @GetMapping("/oauth2/**")
    public ResponseEntity<byte[]> proxyAuthorization(HttpServletRequest req) {
        return proxy(req);
    }

    @GetMapping("/login/oauth2/**")
    public ResponseEntity<byte[]> proxyCallback(HttpServletRequest req) {
        return proxy(req);
    }

    private ResponseEntity<byte[]> proxy(HttpServletRequest request) {
        String path = request.getRequestURI();
        String queryString = request.getQueryString();
        String targetUrl = authUrl + path + (queryString != null ? "?" + queryString : "");

        HttpHeaders headers = new HttpHeaders();
        Enumeration<String> names = request.getHeaderNames();
        while (names.hasMoreElements()) {
            String name = names.nextElement();
            if (!HOP_BY_HOP.contains(name.toLowerCase())) {
                headers.set(name, request.getHeader(name));
            }
        }

        try {
            ResponseEntity<byte[]> upstream = restTemplate.exchange(
                URI.create(targetUrl), HttpMethod.GET, new HttpEntity<>(headers), byte[].class);

            HttpHeaders respHeaders = new HttpHeaders();
            upstream.getHeaders().forEach((name, values) -> {
                if (!HOP_BY_HOP.contains(name.toLowerCase())) {
                    respHeaders.put(name, values);
                }
            });

            return ResponseEntity.status(upstream.getStatusCode())
                .headers(respHeaders)
                .body(upstream.getBody());

        } catch (HttpStatusCodeException ex) {
            // Apache HttpClient5 throws for 3xx too when redirect handling is
            // disabled and the response has no body reachable via getResponseBodyAsByteArray
            // in some cases — but RestTemplate treats 3xx as a normal response,
            // not an exception, by default (only 4xx/5xx trigger this catch).
            log.warn("OAuth2 proxy {} → {}", path, ex.getStatusCode().value());
            return ResponseEntity.status(ex.getStatusCode()).body(ex.getResponseBodyAsByteArray());
        } catch (ResourceAccessException ex) {
            log.warn("OAuth2 proxy {} unreachable: {}", path, ex.getMessage());
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body("{\"error\":\"Auth service temporarily unavailable.\"}".getBytes());
        }
    }
}
