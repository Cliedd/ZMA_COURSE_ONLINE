package com.ztf.zma.community.infrastructure;

import com.ztf.zma.community.support.JwtTestUtils;
import org.junit.jupiter.api.Test;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessagingException;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.MessageBuilder;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * The STOMP handshake HTTP request is permitAll (see SecurityConfig) — this
 * interceptor is the only thing standing between an unauthenticated client
 * and the chat broker, so its accept/reject behavior on CONNECT is the
 * security-critical path to cover.
 */
class ChatChannelInterceptorTest {

    private final JwtUtils jwtUtils = new JwtUtils();
    private final ChatChannelInterceptor interceptor;

    ChatChannelInterceptorTest() {
        ReflectionTestUtils.setField(jwtUtils, "secretKey", JwtTestUtils.SECRET_BASE64);
        interceptor = new ChatChannelInterceptor(jwtUtils);
    }

    private Message<byte[]> connectFrame(String authorizationHeader) {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.CONNECT);
        // Keep the accessor mutable past getMessageHeaders() — matches how the
        // real STOMP inbound channel builds messages before interceptors run,
        // and is required for the interceptor's later setUser() to stick.
        accessor.setLeaveMutable(true);
        if (authorizationHeader != null) {
            accessor.setNativeHeader("Authorization", authorizationHeader);
        }
        return MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());
    }

    @Test
    void connect_withValidBearerToken_setsAuthenticatedUser() {
        String token = JwtTestUtils.token("student@zma.test", "STUDENT");
        Message<byte[]> frame = connectFrame("Bearer " + token);

        interceptor.preSend(frame, null);

        StompHeaderAccessor result = StompHeaderAccessor.wrap(frame);
        assertThat(result.getUser()).isNotNull();
        assertThat(result.getUser().getName()).isEqualTo("student@zma.test");
    }

    @Test
    void connect_withoutAuthorizationHeader_isRejected() {
        assertThatThrownBy(() -> interceptor.preSend(connectFrame(null), null))
                .isInstanceOf(MessagingException.class);
    }

    @Test
    void connect_withInvalidToken_isRejected() {
        assertThatThrownBy(() -> interceptor.preSend(connectFrame("Bearer not-a-real-token"), null))
                .isInstanceOf(MessagingException.class);
    }

    @Test
    void nonConnectFrame_passesThroughWithoutRequiringAuth() {
        StompHeaderAccessor accessor = StompHeaderAccessor.create(StompCommand.SEND);
        accessor.setLeaveMutable(true);
        Message<byte[]> frame = MessageBuilder.createMessage(new byte[0], accessor.getMessageHeaders());

        Message<?> result = interceptor.preSend(frame, null);

        assertThat(result).isSameAs(frame);
    }
}
