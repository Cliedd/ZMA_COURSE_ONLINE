package com.ztf.zma.gateway;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;

/**
 * Per-IP rate limiter using Redis sliding-window counters.
 * Key: gw:rl:{ip}  →  hit count (TTL = window)
 */
@Component
public class GatewayRateLimiter {

    private static final String PREFIX = "gw:rl:";

    private final StringRedisTemplate redis;

    @Value("${gateway.rate-limit.max-requests:100}")
    private int maxRequests;

    @Value("${gateway.rate-limit.window-seconds:60}")
    private long windowSeconds;

    public GatewayRateLimiter(StringRedisTemplate redis) {
        this.redis = redis;
    }

    /** Returns true if the IP is over the limit. */
    public boolean isRateLimited(String ip) {
        String key = PREFIX + ip;
        Long count = redis.opsForValue().increment(key);
        if (count != null && count == 1) {
            redis.expire(key, Duration.ofSeconds(windowSeconds));
        }
        return count != null && count > maxRequests;
    }
}
