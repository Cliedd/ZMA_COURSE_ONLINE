package com.ztf.zma.auth.support;

import com.ztf.zma.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.context.ActiveProfiles;

/**
 * Base class for integration tests in zma-auth.
 * Uses in-memory H2 database (PostgreSQL mode) and in-memory Redis fallback
 * for fast, reliable execution across all CI and local environments.
 */
@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public abstract class AbstractIntegrationTest {

    @Autowired
    protected TestRestTemplate restTemplate;

    @Autowired
    protected UserRepository userRepository;

    @Autowired(required = false)
    protected StringRedisTemplate redisTemplate;

    @BeforeEach
    void cleanState() {
        userRepository.deleteAll();
        if (redisTemplate != null) {
            try {
                var connectionFactory = redisTemplate.getConnectionFactory();
                if (connectionFactory != null) {
                    connectionFactory.getConnection().serverCommands().flushAll();
                }
            } catch (Exception ignored) {}
        }
    }
}
