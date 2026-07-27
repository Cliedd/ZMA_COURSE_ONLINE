package com.ztf.zma.community.domain;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "forum_posts")
public class ForumPost {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String threadId;

    @Column(nullable = false)
    private String authorId;

    @Column(nullable = false, length = 4000)
    private String content;

    private Instant createdAt = Instant.now();
    private Instant updatedAt = Instant.now();

    public ForumPost() {}

    public ForumPost(String threadId, String authorId, String content) {
        this.threadId = threadId;
        this.authorId = authorId;
        this.content = content;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getThreadId() { return threadId; }
    public void setThreadId(String threadId) { this.threadId = threadId; }
    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }
    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
