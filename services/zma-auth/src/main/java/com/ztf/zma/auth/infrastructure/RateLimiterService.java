package com.ztf.zma.auth.infrastructure;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Redis-backed rate limiter with in-memory fallback.
 *
 * Key: ratelimit:{action}:{identifier}  → hit count (TTL = window)
 */
@Service
public class RateLimiterService {

    private static final Logger log = LoggerFactory.getLogger(RateLimiterService.class);
    private static final String PREFIX = "ratelimit:";

    private final StringRedisTemplate redis;
    private final Map<String, Long> fallbackStore = new ConcurrentHashMap<>();

    public RateLimiterService(StringRedisTemplate redis) {
        this.redis = redis;
    }

    public boolean isRateLimited(String action, String identifier,
                                  int maxAttempts, Duration window) {
        String key = PREFIX + action + ":" + identifier;
        try {
            Long count = redis.opsForValue().increment(key);
            if (count != null && count == 1) {
                redis.expire(key, window);
            }
            return count != null && count > maxAttempts;
        } catch (Exception e) {
            log.warn("Redis unavailable for rate limiter, using in-memory store for key {}", key);
            Long count = fallbackStore.compute(key, (k, v) -> v == null ? 1L : v + 1L);
            return count != null && count > maxAttempts;
        }
    }

    public void reset(String action, String identifier) {
        String key = PREFIX + action + ":" + identifier;
        try {
            redis.delete(key);
        } catch (Exception ignored) {}
        fallbackStore.remove(key);
    }

    public long getCount(String action, String identifier) {
        String key = PREFIX + action + ":" + identifier;
        try {
            String val = redis.opsForValue().get(key);
            if (val != null) return Long.parseLong(val);
        } catch (Exception ignored) {}
        return fallbackStore.getOrDefault(key, 0L);
    }
}
