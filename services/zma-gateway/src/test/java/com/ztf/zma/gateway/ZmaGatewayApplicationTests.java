package com.ztf.zma.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Smoke test: verifies the full Spring application context wires up
 * correctly (routing, security, rate limiter, JWT utils, actuator, etc.)
 * with no downstream services or Redis instance actually reachable.
 *
 * Only "jwt.secret" is overridden here (it has no default in
 * application.properties, unlike the gateway.*.url / redis.* properties
 * which already fall back to sane defaults) — everything else keeps
 * using the real application.properties from src/main/resources.
 */
@SpringBootTest(properties = "jwt.secret=dGVzdC1zZWNyZXQta2V5LWZvci1qd3QtdGVzdGluZy1wdXJwb3Nlcy1vbmx5")
class ZmaGatewayApplicationTests {

    @Test
    void contextLoads() {
        // If the ApplicationContext fails to start, this test fails.
    }
}
