package com.ztf.zma.auth.infrastructure;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Manages JWT blacklist, refresh tokens, password-reset tokens,
 * and email-verification tokens in Redis with an in-memory fallback when Redis is unavailable.
 */
@Service
public class RedisTokenService {

    private static final Logger log = LoggerFactory.getLogger(RedisTokenService.class);

    private static final String BLACKLIST_PREFIX  = "blacklist:";
    private static final String REFRESH_PREFIX    = "refresh:";
    private static final String RESET_PREFIX      = "reset:";
    private static final String VERIFY_PREFIX     = "verify:";
    private static final String MFA_CHALLENGE_PREFIX     = "mfa-challenge:";
    private static final long   REFRESH_TTL_DAYS  = 30;
    private static final long   RESET_TTL_MINUTES = 60;
    private static final long   VERIFY_TTL_HOURS  = 24;
    private static final long   MFA_CHALLENGE_TTL_MINUTES = 5;

    private final StringRedisTemplate redis;
    private final Map<String, String> fallbackStore = new ConcurrentHashMap<>();

    public RedisTokenService(StringRedisTemplate redis) {
        this.redis = redis;
    }

    // ── JWT Blacklist (logout) ────────────────────────────────────────────────

    public void blacklistToken(String token, long ttlSeconds) {
        if (ttlSeconds > 0) {
            try {
                redis.opsForValue().set(BLACKLIST_PREFIX + token, "1", ttlSeconds, TimeUnit.SECONDS);
            } catch (Exception e) {
                log.warn("Redis unavailable for blacklistToken, using in-memory store");
                fallbackStore.put(BLACKLIST_PREFIX + token, "1");
            }
        }
    }

    public boolean isBlacklisted(String token) {
        try {
            return Boolean.TRUE.equals(redis.hasKey(BLACKLIST_PREFIX + token));
        } catch (Exception e) {
            return fallbackStore.containsKey(BLACKLIST_PREFIX + token);
        }
    }

    // ── Refresh Tokens ────────────────────────────────────────────────────────

    public String createRefreshToken(String email) {
        String refreshToken = UUID.randomUUID().toString();
        try {
            redis.opsForValue().set(
                REFRESH_PREFIX + refreshToken,
                email,
                Duration.ofDays(REFRESH_TTL_DAYS)
            );
        } catch (Exception e) {
            log.warn("Redis unavailable for createRefreshToken, using in-memory store");
            fallbackStore.put(REFRESH_PREFIX + refreshToken, email);
        }
        return refreshToken;
    }

    public Optional<String> getEmailByRefreshToken(String refreshToken) {
        try {
            String email = redis.opsForValue().get(REFRESH_PREFIX + refreshToken);
            if (email != null) return Optional.of(email);
        } catch (Exception e) {
            log.warn("Redis unavailable for getEmailByRefreshToken, using in-memory store");
        }
        return Optional.ofNullable(fallbackStore.get(REFRESH_PREFIX + refreshToken));
    }

    public void invalidateRefreshToken(String refreshToken) {
        try {
            redis.delete(REFRESH_PREFIX + refreshToken);
        } catch (Exception ignored) {}
        fallbackStore.remove(REFRESH_PREFIX + refreshToken);
    }

    /**
     * Revokes all refresh tokens belonging to {@code email}.
     * Used when an admin changes a user's role so that the next refresh
     * issues a JWT that carries the new role.
     * Scans Redis with pattern {@code refresh:*} and deletes entries whose
     * value equals the email; also sweeps the in-memory fallback store.
     */
    public void invalidateAllRefreshTokensForUser(String email) {
        // In-memory fallback: remove all entries whose value matches the email.
        fallbackStore.entrySet().removeIf(e ->
            e.getKey().startsWith(REFRESH_PREFIX) && email.equals(e.getValue()));

        // Redis: scan refresh:* and delete keys whose stored value is the email.
        try {
            String pattern = REFRESH_PREFIX + "*";
            org.springframework.data.redis.core.Cursor<String> cursor =
                redis.scan(org.springframework.data.redis.core.ScanOptions.scanOptions()
                    .match(pattern).count(200).build());
            while (cursor.hasNext()) {
                String key = cursor.next();
                String storedEmail = redis.opsForValue().get(key);
                if (email.equals(storedEmail)) {
                    redis.delete(key);
                }
            }
            cursor.close();
        } catch (Exception e) {
            log.warn("Redis unavailable for invalidateAllRefreshTokensForUser({})", email);
        }
    }

    // ── Password Reset Tokens ─────────────────────────────────────────────────

    public String createResetToken(String email) {
        String resetToken = UUID.randomUUID().toString();
        try {
            redis.opsForValue().set(
                RESET_PREFIX + resetToken,
                email,
                Duration.ofMinutes(RESET_TTL_MINUTES)
            );
        } catch (Exception e) {
            log.warn("Redis unavailable for createResetToken, using in-memory store");
            fallbackStore.put(RESET_PREFIX + resetToken, email);
        }
        return resetToken;
    }

    public Optional<String> getEmailByResetToken(String resetToken) {
        try {
            String email = redis.opsForValue().get(RESET_PREFIX + resetToken);
            if (email != null) return Optional.of(email);
        } catch (Exception e) {
            log.warn("Redis unavailable for getEmailByResetToken, using in-memory store");
        }
        return Optional.ofNullable(fallbackStore.get(RESET_PREFIX + resetToken));
    }

    public void invalidateResetToken(String resetToken) {
        try {
            redis.delete(RESET_PREFIX + resetToken);
        } catch (Exception ignored) {}
        fallbackStore.remove(RESET_PREFIX + resetToken);
    }

    // ── Email Verification Tokens ─────────────────────────────────────────────

    public String createVerifyToken(String email) {
        String token = UUID.randomUUID().toString();
        try {
            redis.opsForValue().set(
                VERIFY_PREFIX + token,
                email,
                Duration.ofHours(VERIFY_TTL_HOURS)
            );
        } catch (Exception e) {
            log.warn("Redis unavailable for createVerifyToken, using in-memory store");
            fallbackStore.put(VERIFY_PREFIX + token, email);
        }
        return token;
    }

    public Optional<String> getEmailByVerifyToken(String token) {
        try {
            String email = redis.opsForValue().get(VERIFY_PREFIX + token);
            if (email != null) return Optional.of(email);
        } catch (Exception e) {
            log.warn("Redis unavailable for getEmailByVerifyToken, using in-memory store");
        }
        return Optional.ofNullable(fallbackStore.get(VERIFY_PREFIX + token));
    }

    public void invalidateVerifyToken(String token) {
        try {
            redis.delete(VERIFY_PREFIX + token);
        } catch (Exception ignored) {}
        fallbackStore.remove(VERIFY_PREFIX + token);
    }

    // ── MFA Challenge Tokens (login paused pending TOTP code) ────────────────
    //
    // Issued by /login once the password step succeeds for an mfaEnabled
    // account, in place of a real access/refresh token pair. Short TTL and
    // single-use: /mfa/verify consumes it on success, and it is never
    // sufficient on its own to authenticate (still requires the correct
    // TOTP code, which is itself rate-limited — see AuthController).

    public String createMfaChallengeToken(String email) {
        String challengeToken = UUID.randomUUID().toString();
        try {
            redis.opsForValue().set(
                MFA_CHALLENGE_PREFIX + challengeToken,
                email,
                Duration.ofMinutes(MFA_CHALLENGE_TTL_MINUTES)
            );
        } catch (Exception e) {
            log.warn("Redis unavailable for createMfaChallengeToken, using in-memory store");
            fallbackStore.put(MFA_CHALLENGE_PREFIX + challengeToken, email);
        }
        return challengeToken;
    }

    public Optional<String> getEmailByMfaChallengeToken(String challengeToken) {
        try {
            String email = redis.opsForValue().get(MFA_CHALLENGE_PREFIX + challengeToken);
            if (email != null) return Optional.of(email);
        } catch (Exception e) {
            log.warn("Redis unavailable for getEmailByMfaChallengeToken, using in-memory store");
        }
        return Optional.ofNullable(fallbackStore.get(MFA_CHALLENGE_PREFIX + challengeToken));
    }

    public void invalidateMfaChallengeToken(String challengeToken) {
        try {
            redis.delete(MFA_CHALLENGE_PREFIX + challengeToken);
        } catch (Exception ignored) {}
        fallbackStore.remove(MFA_CHALLENGE_PREFIX + challengeToken);
    }
}
