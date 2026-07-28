package com.ztf.zma.community.api;

import com.ztf.zma.community.domain.ChatMessage;
import com.ztf.zma.community.service.ChatService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;

import java.security.Principal;
import java.util.Map;

/**
 * Live chat over STOMP. REST (ChatController) remains the source of truth
 * for history and moderation (edit/delete); this controller only handles
 * the two low-latency, non-critical-path interactions: sending a message
 * (broadcast immediately, not just on next poll) and a typing indicator
 * (never persisted).
 */
@Controller
public class ChatWebSocketController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatWebSocketController(ChatService chatService, SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    @MessageMapping("/rooms/{roomId}/send")
    public void send(@DestinationVariable String roomId, Map<String, String> body, Principal principal) {
        String senderEmail = principal.getName();
        String senderName = body.getOrDefault("senderName", senderEmail);
        ChatMessage saved = chatService.sendMessage(roomId, senderEmail, senderName, body.get("content"));
        messagingTemplate.convertAndSend("/topic/rooms/" + roomId, saved);
    }

    @MessageMapping("/rooms/{roomId}/typing")
    public void typing(@DestinationVariable String roomId, Map<String, String> body, Principal principal) {
        String senderName = body.getOrDefault("senderName", principal.getName());
        messagingTemplate.convertAndSend(
                "/topic/rooms/" + roomId + "/typing",
                Map.of("senderEmail", principal.getName(), "senderName", senderName)
        );
    }
}
