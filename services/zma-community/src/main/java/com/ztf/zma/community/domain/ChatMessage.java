package com.ztf.zma.community.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String roomId;

    /** Email of the sender (from JWT) */
    private String senderEmail;
    private String senderName;

    /** Blank/null allowed when the message carries only an attachment */
    @Column(columnDefinition = "TEXT")
    private String content;

    private LocalDateTime sentAt;

    /** Set when message is edited */
    private LocalDateTime editedAt;

    /** Soft-delete timestamp — non-null means deleted */
    private LocalDateTime deletedAt;

    /** Non-null when this message is a reply within a thread */
    private String parentMessageId;

    /** References a file uploaded via zma-media's presign flow; not validated server-side */
    private String attachmentMediaId;

    /** Client-supplied hint, e.g. "image"/"audio"/"file" */
    private String attachmentType;

    @PrePersist
    protected void onCreate() {
        if (sentAt == null) sentAt = LocalDateTime.now();
    }

    public boolean isDeleted() { return deletedAt != null; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getRoomId() { return roomId; }
    public void setRoomId(String roomId) { this.roomId = roomId; }
    public String getSenderEmail() { return senderEmail; }
    public void setSenderEmail(String senderEmail) { this.senderEmail = senderEmail; }
    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public LocalDateTime getSentAt() { return sentAt; }
    public void setSentAt(LocalDateTime sentAt) { this.sentAt = sentAt; }
    public LocalDateTime getEditedAt() { return editedAt; }
    public void setEditedAt(LocalDateTime editedAt) { this.editedAt = editedAt; }
    public LocalDateTime getDeletedAt() { return deletedAt; }
    public void setDeletedAt(LocalDateTime deletedAt) { this.deletedAt = deletedAt; }
    public String getParentMessageId() { return parentMessageId; }
    public void setParentMessageId(String parentMessageId) { this.parentMessageId = parentMessageId; }
    public String getAttachmentMediaId() { return attachmentMediaId; }
    public void setAttachmentMediaId(String attachmentMediaId) { this.attachmentMediaId = attachmentMediaId; }
    public String getAttachmentType() { return attachmentType; }
    public void setAttachmentType(String attachmentType) { this.attachmentType = attachmentType; }
}
