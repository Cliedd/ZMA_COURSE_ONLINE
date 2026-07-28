package com.ztf.zma.community.service;

import com.ztf.zma.community.domain.ChatMessage;
import com.ztf.zma.community.domain.ChatRoom;
import com.ztf.zma.community.repository.ChatMessageRepository;
import com.ztf.zma.community.repository.ChatRoomRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ChatService {

    private final ChatRoomRepository    roomRepository;
    private final ChatMessageRepository messageRepository;

    public ChatService(ChatRoomRepository roomRepository,
                       ChatMessageRepository messageRepository) {
        this.roomRepository    = roomRepository;
        this.messageRepository = messageRepository;
    }

    @Transactional
    public ChatRoom getOrCreateRoom(String courseId, String courseName, String createdByEmail) {
        return roomRepository.findByCourseId(courseId).orElseGet(() -> {
            ChatRoom room = new ChatRoom();
            room.setCourseId(courseId);
            room.setCourseName(courseName);
            room.setCreatedByEmail(createdByEmail);
            return roomRepository.save(room);
        });
    }

    public ChatRoom getRoomByCourse(String courseId) {
        return roomRepository.findByCourseId(courseId)
                .orElseThrow(() -> new RuntimeException("Chat room not found for course: " + courseId));
    }

    public List<ChatRoom> getRoomsByTeacher(String email) {
        return roomRepository.findByCreatedByEmail(email);
    }

    @Transactional
    public ChatMessage sendMessage(String roomId, String senderEmail,
                                   String senderName, String content) {
        roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));

        ChatMessage msg = new ChatMessage();
        msg.setRoomId(roomId);
        msg.setSenderEmail(senderEmail);
        msg.setSenderName(senderName);
        msg.setContent(content);
        return messageRepository.save(msg);
    }

    /** Paginated messages (newest first) */
    public Page<ChatMessage> getMessagesPaged(String roomId, int page, int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        return messageRepository.findByRoomIdOrderBySentAtDesc(roomId, pageable);
    }

    public List<ChatMessage> getMessagesAfter(String roomId, LocalDateTime after) {
        return messageRepository.findByRoomIdAndSentAtAfterOrderBySentAtAsc(roomId, after);
    }

    @Transactional
    public ChatMessage editMessage(String messageId, String senderEmail, String newContent) {
        ChatMessage msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        if (!msg.getSenderEmail().equals(senderEmail)) {
            throw new RuntimeException("Access denied: not your message");
        }
        if (msg.isDeleted()) {
            throw new RuntimeException("Cannot edit deleted message");
        }
        msg.setContent(newContent);
        msg.setEditedAt(LocalDateTime.now());
        return messageRepository.save(msg);
    }

    @Transactional
    public ChatMessage deleteMessage(String messageId, String senderEmail, String role) {
        ChatMessage msg = messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));
        // Sender or admin/teacher can delete
        if (!msg.getSenderEmail().equals(senderEmail)
                && !"ADMIN".equals(role) && !"TEACHER".equals(role)) {
            throw new RuntimeException("Access denied");
        }
        msg.setDeletedAt(LocalDateTime.now());
        msg.setContent("[deleted]");
        return messageRepository.save(msg);
    }
}
