package com.ztf.zma.community.infrastructure;

import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;

import java.util.List;

/**
 * Authenticates the STOMP CONNECT frame using the same Bearer JWT clients
 * already hold for REST calls. Once set, the resulting Principal is attached
 * to the STOMP session and is available as Principal/Authentication in every
 * @MessageMapping handler for the lifetime of the WebSocket connection.
 */
@Component
public class ChatChannelInterceptor implements ChannelInterceptor {

    private final JwtUtils jwtUtils;

    public ChatChannelInterceptor(JwtUtils jwtUtils) {
        this.jwtUtils = jwtUtils;
    }

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        // getAccessor (not wrap) returns the original mutable accessor while the
        // message is still in-flight through the channel, so setUser below is
        // visible to every later interceptor/handler for this same message.
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) {
            accessor = StompHeaderAccessor.wrap(message);
        }
        if (StompCommand.CONNECT.equals(accessor.getCommand())) {
            String header = accessor.getFirstNativeHeader("Authorization");
            String token = StringUtils.hasText(header) && header.startsWith("Bearer ")
                    ? header.substring(7)
                    : null;

            if (token == null || !jwtUtils.validateToken(token)) {
                throw new org.springframework.messaging.MessagingException("Invalid or missing JWT for WebSocket CONNECT");
            }

            String email = jwtUtils.getEmailFromToken(token);
            String role = jwtUtils.getRoleFromToken(token);
            var auth = new UsernamePasswordAuthenticationToken(
                    email, null, List.of(new SimpleGrantedAuthority("ROLE_" + role)));
            accessor.setUser(auth);
        }
        return message;
    }
}
