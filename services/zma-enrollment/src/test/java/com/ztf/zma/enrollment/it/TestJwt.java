package com.ztf.zma.enrollment.it;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

/**
 * Builds signed JWTs for integration tests, matching the claims format
 * expected by JwtUtils (subject = email, "role" claim).
 */
public final class TestJwt {

    /** Base64-encoded 256-bit secret, shared with the test datasource property override. */
    public static final String SECRET_B64 = "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=";

    private TestJwt() { }

    private static SecretKey key() {
        return Keys.hmacShaKeyFor(java.util.Base64.getDecoder().decode(SECRET_B64));
    }

    public static String token(String email, String role) {
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plus(1, ChronoUnit.HOURS)))
                .signWith(key())
                .compact();
    }
}
