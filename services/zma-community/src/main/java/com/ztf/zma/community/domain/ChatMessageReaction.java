package com.ztf.zma.community.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

/**
 * An emoji reaction from one user on one message. Adding the same emoji
 * again from the same user toggles it off (see ChatService#toggleReaction).
 */
@Entity
@Table(name = "chat_message_reactions", uniqueConstraints = {
        @UniqueConstraint(name = "uk_reaction_message_emoji_user", columnNames = {"message_id", "emoji", "user_email"})
})
public class ChatMessageReaction {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "message_id", nullable = false)
    private String messageId;

    @Column(nullable = false)
    private String emoji;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (createdAt == null) createdAt = LocalDateTime.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getMessageId() { return messageId; }
    public void setMessageId(String messageId) { this.messageId = messageId; }
    public String getEmoji() { return emoji; }
    public void setEmoji(String emoji) { this.emoji = emoji; }
    public String getUserEmail() { return userEmail; }
    public void setUserEmail(String userEmail) { this.userEmail = userEmail; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
