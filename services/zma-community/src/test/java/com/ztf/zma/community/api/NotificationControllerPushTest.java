package com.ztf.zma.community.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ztf.zma.community.repository.PushSubscriptionRepository;
import com.ztf.zma.community.support.AbstractIntegrationTest;
import com.ztf.zma.community.support.JwtTestUtils;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

class NotificationControllerPushTest extends AbstractIntegrationTest {

    @Autowired
    private PushSubscriptionRepository pushSubscriptionRepository;

    private final ObjectMapper objectMapper = new ObjectMapper();

    private String validPayload(String endpoint) throws Exception {
        return objectMapper.writeValueAsString(Map.of(
                "endpoint", endpoint,
                "keys", Map.of(
                        "p256dh", "BNcRdreALRFXTkOOUHK1EtK2wtaz5Ry4YfYCA_0QTpQtUbVlUls0VJXg7A8u-Ts1XbjhazAkj7I99e8QcYP7DkM",
                        "auth", "tBHItJI5svbpez7KI4CCXg"
                )
        ));
    }

    @Test
    void subscribe_withValidPayload_storesSubscription() throws Exception {
        MockMvc mockMvc = mockMvc();
        String token = JwtTestUtils.token("push-user1@zma.test", "STUDENT");

        mockMvc.perform(post("/api/v1/notifications/push/subscribe")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validPayload("https://fcm.googleapis.com/fcm/send/endpoint-1")))
                .andExpect(status().isCreated());

        assertThat(pushSubscriptionRepository.findByUserEmail("push-user1@zma.test")).hasSize(1);
    }

    @Test
    void subscribe_sameEndpointTwice_doesNotDuplicate() throws Exception {
        MockMvc mockMvc = mockMvc();
        String token = JwtTestUtils.token("push-user2@zma.test", "STUDENT");
        String payload = validPayload("https://fcm.googleapis.com/fcm/send/endpoint-2");

        mockMvc.perform(post("/api/v1/notifications/push/subscribe")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/notifications/push/subscribe")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated());

        assertThat(pushSubscriptionRepository.findByUserEmail("push-user2@zma.test")).hasSize(1);
    }

    @Test
    void subscribe_missingKeys_returns400() throws Exception {
        MockMvc mockMvc = mockMvc();
        String token = JwtTestUtils.token("push-user3@zma.test", "STUDENT");
        String garbage = objectMapper.writeValueAsString(Map.of("endpoint", "https://fcm.googleapis.com/fcm/send/endpoint-3"));

        mockMvc.perform(post("/api/v1/notifications/push/subscribe")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(garbage))
                .andExpect(status().isBadRequest());
    }

    @Test
    void subscribe_missingEndpoint_returns400() throws Exception {
        MockMvc mockMvc = mockMvc();
        String token = JwtTestUtils.token("push-user4@zma.test", "STUDENT");
        String garbage = objectMapper.writeValueAsString(Map.of(
                "keys", Map.of("p256dh", "abc", "auth", "def")
        ));

        mockMvc.perform(post("/api/v1/notifications/push/subscribe")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(garbage))
                .andExpect(status().isBadRequest());
    }

    @Test
    void subscribe_emptyBody_returns400NotServerError() throws Exception {
        MockMvc mockMvc = mockMvc();
        String token = JwtTestUtils.token("push-user5@zma.test", "STUDENT");

        mockMvc.perform(post("/api/v1/notifications/push/subscribe")
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void subscribe_withoutAuthentication_isRejected() throws Exception {
        MockMvc mockMvc = mockMvc();

        mockMvc.perform(post("/api/v1/notifications/push/subscribe")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(validPayload("https://fcm.googleapis.com/fcm/send/endpoint-6")))
                .andExpect(result -> assertThat(result.getResponse().getStatus()).isIn(401, 403));
    }
}
