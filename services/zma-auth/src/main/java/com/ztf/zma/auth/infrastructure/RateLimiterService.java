package com.ztf.zma.auth.infrastructure;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

/**
 * Redis-backed rate limiter.
 *
 * Key: ratelimit:{action}:{identifier}  → hit count (TTL = window)
 * Used for:
 *   - Login brute-force: action=login, identifier=IP
 *   - Password-reset abuse: action=reset, identifier=email
 */
@Service
public class RateLimiterService {

    private static final String PREFIX = "ratelimit:";

    private final StringRedisTemplate redis;

    public RateLimiterService(StringRedisTemplate redis) {
        this.redis = redis;
    }

    /**
     * Increments the counter and returns true if the limit is exceeded.
     *
     * @param action     e.g. "login", "reset"
     * @param identifier e.g. IP address or email
     * @param maxAttempts maximum allowed hits in the window
     * @param window      TTL for the counter key
     */
    public boolean isRateLimited(String action, String identifier,
                                  int maxAttempts, Duration window) {
        String key = PREFIX + action + ":" + identifier;
        Long count = redis.opsForValue().increment(key);
        if (count != null && count == 1) {
            redis.expire(key, window);
        }
        return count != null && count > maxAttempts;
    }

    public void reset(String action, String identifier) {
        redis.delete(PREFIX + action + ":" + identifier);
    }

    public long getCount(String action, String identifier) {
        String val = redis.opsForValue().get(PREFIX + action + ":" + identifier);
        return val == null ? 0 : Long.parseLong(val);
    }
}
