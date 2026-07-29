package com.ztf.zma.media.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

/**
 * One transcoded rendition of a source video Media item (e.g. "720p").
 * Created by TranscodingService when POST /api/v1/media/transcode/{fileId}
 * is triggered — one row per target resolution that qualifies (source
 * resolution is never upscaled).
 */
@Entity
@Table(name = "media_variant")
public class MediaVariant {

    @Id
    private String id;

    /** Owning source Media#id */
    private String mediaId;

    /** e.g. "1080p", "720p", "480p" */
    private String resolution;

    private Integer width;
    private Integer height;

    /** Storage key for the transcoded output, once READY. Null until then. */
    private String s3Key;

    /** PENDING | PROCESSING | READY | FAILED */
    private String status;

    /** Truncated ffmpeg stderr diagnostic, only set when status=FAILED. */
    @Column(length = 2000)
    private String errorMessage;

    private Instant createdAt;
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
        if (createdAt == null) createdAt = Instant.now();
        updatedAt = Instant.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getMediaId() { return mediaId; }
    public void setMediaId(String mediaId) { this.mediaId = mediaId; }
    public String getResolution() { return resolution; }
    public void setResolution(String resolution) { this.resolution = resolution; }
    public Integer getWidth() { return width; }
    public void setWidth(Integer width) { this.width = width; }
    public Integer getHeight() { return height; }
    public void setHeight(Integer height) { this.height = height; }
    public String getS3Key() { return s3Key; }
    public void setS3Key(String s3Key) { this.s3Key = s3Key; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getErrorMessage() { return errorMessage; }
    public void setErrorMessage(String errorMessage) { this.errorMessage = errorMessage; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
