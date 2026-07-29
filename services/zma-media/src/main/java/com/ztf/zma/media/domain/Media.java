package com.ztf.zma.media.domain;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "media")
public class Media {
    @Id
    private String id;

    private String fileName;
    private Long size;
    private String s3Key;

    /** MIME type (image/jpeg, video/mp4, application/pdf…) */
    private String contentType;

    /** UPLOADING | READY | ERROR */
    private String status;

    /** Email of the uploader */
    private String uploadedBy;

    /** Optional: associate media to a course */
    private String courseId;

    /** Optional: associate media to a specific lesson */
    private String lessonId;

    /**
     * Optional upload purpose hint, e.g. "AVATAR". When set to "AVATAR" and the
     * content type is a resizable image, the direct-upload flow will resize and
     * re-encode the file (see ImageProcessingService) before marking it READY.
     */
    private String purpose;

    private Instant uploadedAt;

    /** Soft-delete timestamp */
    private Instant deletedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID().toString();
        if (uploadedAt == null) uploadedAt = Instant.now();
    }

    public boolean isDeleted() { return deletedAt != null; }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public Long getSize() { return size; }
    public void setSize(Long size) { this.size = size; }
    public String getS3Key() { return s3Key; }
    public void setS3Key(String s3Key) { this.s3Key = s3Key; }
    public String getContentType() { return contentType; }
    public void setContentType(String contentType) { this.contentType = contentType; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(String uploadedBy) { this.uploadedBy = uploadedBy; }
    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }
    public String getLessonId() { return lessonId; }
    public void setLessonId(String lessonId) { this.lessonId = lessonId; }
    public String getPurpose() { return purpose; }
    public void setPurpose(String purpose) { this.purpose = purpose; }
    public Instant getUploadedAt() { return uploadedAt; }
    public void setUploadedAt(Instant uploadedAt) { this.uploadedAt = uploadedAt; }
    public Instant getDeletedAt() { return deletedAt; }
    public void setDeletedAt(Instant deletedAt) { this.deletedAt = deletedAt; }
}
