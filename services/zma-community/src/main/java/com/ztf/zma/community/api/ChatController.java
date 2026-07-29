package com.ztf.zma.community.api;

import com.ztf.zma.community.domain.ChatMessage;
import com.ztf.zma.community.domain.ChatRoom;
import com.ztf.zma.community.service.ChatService;
import com.ztf.zma.community.service.ReactionSummary;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/community/rooms")
public class ChatController {

    private final ChatService chatService;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(ChatService chatService, SimpMessagingTemplate messagingTemplate) {
        this.chatService = chatService;
        this.messagingTemplate = messagingTemplate;
    }

    /** Create or retrieve the chat room for a course */
    @Operation(summary = "Create or get a course chat room")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ChatRoom createOrGetRoom(@RequestBody Map<String, String> body,
                                    Authentication auth) {
        return chatService.getOrCreateRoom(
                body.get("courseId"),
                body.get("courseName"),
                auth.getName()
        );
    }

    @GetMapping("/course/{courseId}")
    public ChatRoom getRoomByCourse(@PathVariable String courseId) {
        return chatService.getRoomByCourse(courseId);
    }

    @GetMapping("/teacher/{email}")
    public List<ChatRoom> getRoomsByTeacher(@PathVariable String email) {
        return chatService.getRoomsByTeacher(email);
    }

    /** Send a message — sender identity comes from JWT */
    @Operation(summary = "Send a chat message", description = "Sender identity is derived from the JWT, not client-supplied")
    @PostMapping("/{roomId}/messages")
    @ResponseStatus(HttpStatus.CREATED)
    public ChatMessage sendMessage(
            @PathVariable String roomId,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        ChatMessage saved = chatService.sendMessage(
                roomId,
                auth.getName(),
                body.getOrDefault("senderName", auth.getName()),
                body.get("content"),
                body.get("parentMessageId"),
                body.get("attachmentMediaId"),
                body.get("attachmentType")
        );
        messagingTemplate.convertAndSend("/topic/rooms/" + roomId, saved);
        return saved;
    }

    /** Replies to a message, ordered oldest-first */
    @Operation(summary = "Get the thread of replies to a message")
    @GetMapping("/{roomId}/messages/{messageId}/thread")
    public List<ChatMessage> getThread(
            @PathVariable String roomId,
            @PathVariable String messageId) {
        return chatService.getThread(messageId);
    }

    /** Toggle an emoji reaction on a message — adding the same emoji again removes it */
    @Operation(summary = "Toggle a reaction on a chat message")
    @PostMapping("/{roomId}/messages/{messageId}/reactions")
    public ReactionSummary toggleReaction(
            @PathVariable String roomId,
            @PathVariable String messageId,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        ReactionSummary summary = chatService.toggleReaction(messageId, auth.getName(), body.get("emoji"));
        messagingTemplate.convertAndSend("/topic/rooms/" + roomId + "/reactions", summary);
        return summary;
    }

    /** Paginated messages — page=0, size=50 default */
    @GetMapping("/{roomId}/messages")
    public Page<ChatMessage> getMessages(
            @PathVariable String roomId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "50") int size,
            @RequestParam(required = false) String after) {
        if (after != null && !after.isBlank()) {
            // Backward-compat: return as list wrapped in a lightweight response
            List<ChatMessage> msgs = chatService.getMessagesAfter(roomId, LocalDateTime.parse(after));
            return new org.springframework.data.domain.PageImpl<>(msgs);
        }
        return chatService.getMessagesPaged(roomId, page, size);
    }

    /** Edit a message (sender only) */
    @Operation(summary = "Edit a chat message", description = "Only the original sender may edit their message")
    @PatchMapping("/{roomId}/messages/{messageId}")
    public ChatMessage editMessage(
            @PathVariable String roomId,
            @PathVariable String messageId,
            @RequestBody Map<String, String> body,
            Authentication auth) {
        ChatMessage edited = chatService.editMessage(messageId, auth.getName(), body.get("content"));
        messagingTemplate.convertAndSend("/topic/rooms/" + roomId, edited);
        return edited;
    }

    /** Soft-delete a message (sender, or ADMIN/TEACHER) */
    @Operation(summary = "Delete a chat message", description = "Sender, ADMIN, or TEACHER only")
    @DeleteMapping("/{roomId}/messages/{messageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMessage(
            @PathVariable String roomId,
            @PathVariable String messageId,
            Authentication auth) {
        ChatMessage deleted = chatService.deleteMessage(messageId, auth.getName(), getRole(auth));
        messagingTemplate.convertAndSend("/topic/rooms/" + roomId, deleted);
    }

    private String getRole(Authentication auth) {
        return auth.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .filter(a -> a.startsWith("ROLE_"))
            .map(a -> a.substring(5))
            .findFirst().orElse("STUDENT");
    }
}
