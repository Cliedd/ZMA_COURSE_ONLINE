package com.ztf.zma.payment.support;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;
import java.time.Instant;
import java.util.Date;

/**
 * Builds valid JWTs signed with the same secret configured in application-test.properties.
 */
public final class JwtTestUtils {

    public static final String SECRET_BASE64 = "wTttfwluXbJn8FOJj8UAlR5DDbvzyjlaqdKuN811f5M=";

    private JwtTestUtils() {}

    public static String token(String email, String role) {
        SecretKey key = Keys.hmacShaKeyFor(Decoders.BASE64.decode(SECRET_BASE64));
        Instant now = Instant.now();
        return Jwts.builder()
                .subject(email)
                .claim("role", role)
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusSeconds(3600)))
                .signWith(key)
                .compact();
    }
}
