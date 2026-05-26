package com.ztf.zma.auth.infrastructure;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

/**
 * Manages JWT blacklist, refresh tokens, password-reset tokens,
 * and email-verification tokens in Redis.
 *
 * Key namespaces:
 *   blacklist:{token}            → "1"       (TTL = remaining JWT lifetime)
 *   refresh:{refreshToken}       → email     (TTL = 30 days)
 *   reset:{resetToken}           → email     (TTL = 1 hour)
 *   verify:{verifyToken}         → email     (TTL = 24 hours)
 */
@Service
public class RedisTokenService {

    private static final String BLACKLIST_PREFIX  = "blacklist:";
    private static final String REFRESH_PREFIX    = "refresh:";
    private static final String RESET_PREFIX      = "reset:";
    private static final String VERIFY_PREFIX     = "verify:";
    private static final long   REFRESH_TTL_DAYS  = 30;
    private static final long   RESET_TTL_MINUTES = 60;
    private static final long   VERIFY_TTL_HOURS  = 24;

    private final StringRedisTemplate redis;

    public RedisTokenService(StringRedisTemplate redis) {
        this.redis = redis;
    }

    // ── JWT Blacklist (logout) ────────────────────────────────────────────────

    public void blacklistToken(String token, long ttlSeconds) {
        if (ttlSeconds > 0) {
            redis.opsForValue().set(BLACKLIST_PREFIX + token, "1", ttlSeconds, TimeUnit.SECONDS);
        }
    }

    public boolean isBlacklisted(String token) {
        return Boolean.TRUE.equals(redis.hasKey(BLACKLIST_PREFIX + token));
    }

    // ── Refresh Tokens ────────────────────────────────────────────────────────

    public String createRefreshToken(String email) {
        String refreshToken = UUID.randomUUID().toString();
        redis.opsForValue().set(
            REFRESH_PREFIX + refreshToken,
            email,
            Duration.ofDays(REFRESH_TTL_DAYS)
        );
        return refreshToken;
    }

    public Optional<String> getEmailByRefreshToken(String refreshToken) {
        String email = redis.opsForValue().get(REFRESH_PREFIX + refreshToken);
        return Optional.ofNullable(email);
    }

    public void invalidateRefreshToken(String refreshToken) {
        redis.delete(REFRESH_PREFIX + refreshToken);
    }

    // ── Password Reset Tokens ─────────────────────────────────────────────────

    public String createResetToken(String email) {
        String resetToken = UUID.randomUUID().toString();
        redis.opsForValue().set(
            RESET_PREFIX + resetToken,
            email,
            Duration.ofMinutes(RESET_TTL_MINUTES)
        );
        return resetToken;
    }

    public Optional<String> getEmailByResetToken(String resetToken) {
        String email = redis.opsForValue().get(RESET_PREFIX + resetToken);
        return Optional.ofNullable(email);
    }

    public void invalidateResetToken(String resetToken) {
        redis.delete(RESET_PREFIX + resetToken);
    }

    // ── Email Verification Tokens ─────────────────────────────────────────────

    public String createVerifyToken(String email) {
        String token = UUID.randomUUID().toString();
        redis.opsForValue().set(
            VERIFY_PREFIX + token,
            email,
            Duration.ofHours(VERIFY_TTL_HOURS)
        );
        return token;
    }

    public Optional<String> getEmailByVerifyToken(String token) {
        return Optional.ofNullable(redis.opsForValue().get(VERIFY_PREFIX + token));
    }

    public void invalidateVerifyToken(String token) {
        redis.delete(VERIFY_PREFIX + token);
    }
}
