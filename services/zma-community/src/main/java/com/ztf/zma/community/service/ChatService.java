package com.ztf.zma.community.service;

import com.ztf.zma.community.domain.ChatMessage;
import com.ztf.zma.community.domain.ChatMessageReaction;
import com.ztf.zma.community.domain.ChatRoom;
import com.ztf.zma.community.domain.ChatRoomMember;
import com.ztf.zma.community.repository.ChatMessageReactionRepository;
import com.ztf.zma.community.repository.ChatMessageRepository;
import com.ztf.zma.community.repository.ChatRoomMemberRepository;
import com.ztf.zma.community.repository.ChatRoomRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ChatService {

    private static final Logger log = LoggerFactory.getLogger(ChatService.class);

    private final ChatRoomRepository            roomRepository;
    private final ChatMessageRepository         messageRepository;
    private final ChatMessageReactionRepository reactionRepository;
    private final ChatRoomMemberRepository      memberRepository;

    public ChatService(ChatRoomRepository roomRepository,
                       ChatMessageRepository messageRepository,
                       ChatMessageReactionRepository reactionRepository,
                       ChatRoomMemberRepository memberRepository) {
        this.roomRepository     = roomRepository;
        this.messageRepository  = messageRepository;
        this.reactionRepository = reactionRepository;
        this.memberRepository   = memberRepository;
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

    /**
     * Ajoute l'étudiant au canal de chat du cours s'il n'en est pas déjà membre.
     * Appelé en fire-and-forget depuis zma-enrollment après inscription.
     */
    @Transactional
    public void addMember(String courseId, String studentEmail) {
        roomRepository.findByCourseId(courseId).ifPresentOrElse(room -> {
            if (!memberRepository.existsByRoomIdAndStudentEmail(room.getId(), studentEmail)) {
                ChatRoomMember member = new ChatRoomMember();
                member.setRoomId(room.getId());
                member.setStudentEmail(studentEmail);
                memberRepository.save(member);
                log.info("Étudiant {} ajouté au canal du cours {}", studentEmail, courseId);
            }
        }, () -> log.debug("Canal non encore créé pour le cours {}, skip addMember", courseId));
    }

    /** Nombre de membres actifs dans un canal */
    public long getMemberCount(String roomId) {
        return memberRepository.countByRoomId(roomId);
    }

    @Transactional
    public ChatMessage sendMessage(String roomId, String senderEmail,
                                   String senderName, String content) {
        return sendMessage(roomId, senderEmail, senderName, content, null, null, null);
    }

    @Transactional
    public ChatMessage sendMessage(String roomId, String senderEmail, String senderName, String content,
                                   String parentMessageId, String attachmentMediaId, String attachmentType) {
        roomRepository.findById(roomId)
                .orElseThrow(() -> new RuntimeException("Chat room not found"));

        boolean hasContent = content != null && !content.isBlank();
        boolean hasAttachment = attachmentMediaId != null && !attachmentMediaId.isBlank();
        if (!hasContent && !hasAttachment) {
            throw new IllegalArgumentException("Message must have content or an attachment");
        }

        ChatMessage msg = new ChatMessage();
        msg.setRoomId(roomId);
        msg.setSenderEmail(senderEmail);
        msg.setSenderName(senderName);
        msg.setContent(hasContent ? content : "");
        msg.setParentMessageId(parentMessageId);
        msg.setAttachmentMediaId(attachmentMediaId);
        msg.setAttachmentType(attachmentType);
        return messageRepository.save(msg);
    }

    /** Replies to a message, ordered oldest-first */
    public List<ChatMessage> getThread(String parentMessageId) {
        return messageRepository.findByParentMessageIdOrderBySentAtAsc(parentMessageId);
    }

    /**
     * Toggles an emoji reaction from a user on a message: adding the same
     * emoji again removes it. Returns the updated room-wide summary.
     */
    @Transactional
    public ReactionSummary toggleReaction(String messageId, String userEmail, String emoji) {
        messageRepository.findById(messageId)
                .orElseThrow(() -> new RuntimeException("Message not found"));

        reactionRepository.findByMessageIdAndEmojiAndUserEmail(messageId, emoji, userEmail)
                .ifPresentOrElse(
                        reactionRepository::delete,
                        () -> {
                            ChatMessageReaction reaction = new ChatMessageReaction();
                            reaction.setMessageId(messageId);
                            reaction.setEmoji(emoji);
                            reaction.setUserEmail(userEmail);
                            reactionRepository.save(reaction);
                        }
                );

        return buildReactionSummary(messageId);
    }

    private ReactionSummary buildReactionSummary(String messageId) {
        List<ChatMessageReaction> reactions = reactionRepository.findByMessageId(messageId);

        Map<String, List<String>> reactors = reactions.stream()
                .collect(Collectors.groupingBy(
                        ChatMessageReaction::getEmoji,
                        LinkedHashMap::new,
                        Collectors.mapping(ChatMessageReaction::getUserEmail, Collectors.toList())
                ));
        Map<String, Long> counts = reactors.entrySet().stream()
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        e -> (long) e.getValue().size(),
                        (a, b) -> a,
                        LinkedHashMap::new
                ));

        return new ReactionSummary(messageId, counts, reactors);
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
