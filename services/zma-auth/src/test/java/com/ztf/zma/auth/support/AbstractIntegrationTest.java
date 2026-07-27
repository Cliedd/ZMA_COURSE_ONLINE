package com.ztf.zma.auth.support;

import com.ztf.zma.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.DockerClientFactory;
import org.testcontainers.containers.GenericContainer;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

/**
 * Base class for integration tests: uses Testcontainers (Postgres + Redis)
 * when Docker is available, or falls back to in-memory H2 / properties when not.
 */
@ActiveProfiles("test")
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
public abstract class AbstractIntegrationTest {

    static final boolean IS_DOCKER_AVAILABLE;
    static PostgreSQLContainer<?> POSTGRES;
    static GenericContainer<?> REDIS;

    static {
        boolean available = false;
        try {
            available = DockerClientFactory.instance().isDockerAvailable();
        } catch (Throwable t) {
            available = false;
        }
        IS_DOCKER_AVAILABLE = available;

        if (IS_DOCKER_AVAILABLE) {
            try {
                POSTGRES = new PostgreSQLContainer<>(DockerImageName.parse("postgres:16-alpine"))
                        .withDatabaseName("zma_db")
                        .withUsername("zma_admin")
                        .withPassword("devpassword")
                        .withInitScript("init-auth-test.sql");
                POSTGRES.start();

                REDIS = new GenericContainer<>(DockerImageName.parse("redis:7-alpine"))
                        .withExposedPorts(6379);
                REDIS.start();
            } catch (Throwable t) {
                POSTGRES = null;
                REDIS = null;
            }
        }
    }

    @DynamicPropertySource
    static void dynamicProperties(DynamicPropertyRegistry registry) {
        if (POSTGRES != null && POSTGRES.isRunning()) {
            registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
            registry.add("spring.datasource.username", POSTGRES::getUsername);
            registry.add("spring.datasource.password", POSTGRES::getPassword);
        }
        if (REDIS != null && REDIS.isRunning()) {
            registry.add("spring.data.redis.host", REDIS::getHost);
            registry.add("spring.data.redis.port", () -> REDIS.getMappedPort(6379));
        }
    }

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
