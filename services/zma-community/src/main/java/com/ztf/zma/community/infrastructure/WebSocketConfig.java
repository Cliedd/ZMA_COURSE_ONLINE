package com.ztf.zma.community.infrastructure;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

/**
 * STOMP over WebSocket for live chat. The endpoint is exposed at /ws and is
 * reached either directly (container network) or via a dedicated nginx
 * location that proxies the Upgrade handshake straight to this service —
 * the gateway's RestTemplate-based proxy buffers full request/response
 * bodies and cannot forward a WebSocket upgrade.
 */
@Configuration
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

    private final ChatChannelInterceptor chatChannelInterceptor;

    @Value("${cors.allowed-origins:http://localhost:5173,http://localhost}")
    private String allowedOrigins;

    public WebSocketConfig(ChatChannelInterceptor chatChannelInterceptor) {
        this.chatChannelInterceptor = chatChannelInterceptor;
    }

    @Override
    public void registerStompEndpoints(StompEndpointRegistry registry) {
        registry.addEndpoint("/ws")
                .setAllowedOrigins(allowedOrigins.split(","));
    }

    @Override
    public void configureMessageBroker(MessageBrokerRegistry registry) {
        registry.enableSimpleBroker("/topic");
        registry.setApplicationDestinationPrefixes("/app");
    }

    @Override
    public void configureClientInboundChannel(org.springframework.messaging.simp.config.ChannelRegistration registration) {
        registration.interceptors(chatChannelInterceptor);
    }
}
