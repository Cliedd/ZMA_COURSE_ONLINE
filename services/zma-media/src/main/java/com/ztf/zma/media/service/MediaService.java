package com.ztf.zma.media.service;

import com.ztf.zma.media.domain.Media;
import com.ztf.zma.media.repository.MediaRepository;
import com.ztf.zma.media.storage.PresignedUrlResponse;
import com.ztf.zma.media.storage.StorageService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Service
public class MediaService {

    /** Allowed MIME types */
    private static final Set<String> ALLOWED_TYPES = Set.of(
        "image/jpeg", "image/png", "image/webp", "image/gif",
        "video/mp4", "video/webm", "video/quicktime",
        "application/pdf",
        "application/zip",
        "audio/mpeg", "audio/wav"
    );

    /** Max file size: 2 GB */
    private static final long MAX_SIZE_BYTES = 2L * 1024 * 1024 * 1024;

    private final MediaRepository mediaRepository;
    private final StorageService  storageService;

    public MediaService(MediaRepository mediaRepository, StorageService storageService) {
        this.mediaRepository = mediaRepository;
        this.storageService  = storageService;
    }

    @Transactional
    public PresignUrlWithId requestUpload(String fileName, String contentType,
                                          long sizeBytes, String uploadedBy) {
        // Validate file type
        if (!ALLOWED_TYPES.contains(contentType.toLowerCase())) {
            throw new RuntimeException("File type not allowed: " + contentType);
        }
        // Validate size
        if (sizeBytes > MAX_SIZE_BYTES) {
            throw new RuntimeException("File too large. Maximum size is 2 GB.");
        }

        // Pre-generate the UUID so the storage layer can use it (e.g. local upload endpoint)
        String mediaId = UUID.randomUUID().toString();

        PresignedUrlResponse presigned = storageService
                .generatePresignedUploadUrl(mediaId, fileName, contentType, sizeBytes);

        Media media = new Media();
        media.setId(mediaId);
        media.setFileName(fileName);
        media.setSize(sizeBytes);
        media.setContentType(contentType);
        media.setS3Key(presigned.s3Key());
        media.setStatus("UPLOADING");
        media.setUploadedBy(uploadedBy);
        Media saved = mediaRepository.save(media);

        return new PresignUrlWithId(saved.getId(), presigned.uploadUrl(),
                presigned.s3Key(), presigned.expiresInSeconds());
    }

    @Transactional
    public Media confirmUpload(String mediaId) {
        Media media = getById(mediaId);
        storageService.confirmUpload(media.getS3Key());
        media.setStatus("READY");
        return mediaRepository.save(media);
    }

    /** Attach media to a course and/or lesson */
    @Transactional
    public Media attach(String mediaId, String courseId, String lessonId) {
        Media media = getById(mediaId);
        if (courseId != null) media.setCourseId(courseId);
        if (lessonId != null) media.setLessonId(lessonId);
        return mediaRepository.save(media);
    }

    /** Generate a time-limited CDN/download URL */
    public String getDownloadUrl(String mediaId) {
        Media media = getById(mediaId);
        if (!"READY".equals(media.getStatus())) {
            throw new RuntimeException("Media is not ready");
        }
        return storageService.generateDownloadUrl(media.getS3Key(), 3600);
    }

    /** Soft-delete: sets deletedAt and deletes the file from storage */
    @Transactional
    public void deleteMedia(String mediaId, String requestingUser, String role) {
        Media media = getById(mediaId);
        if (!media.getUploadedBy().equals(requestingUser)
                && !"ADMIN".equals(role) && !"TEACHER".equals(role)) {
            throw new RuntimeException("Access denied");
        }
        storageService.deleteFile(media.getS3Key());
        media.setDeletedAt(Instant.now());
        media.setStatus("DELETED");
        mediaRepository.save(media);
    }

    public Media getById(String id) {
        return mediaRepository.findById(id)
                .filter(m -> !m.isDeleted())
                .orElseThrow(() -> new RuntimeException("Media not found"));
    }

    public List<Media> listByCourse(String courseId) {
        return mediaRepository.findByCourseIdAndDeletedAtIsNull(courseId);
    }

    public List<Media> listByLesson(String lessonId) {
        return mediaRepository.findByLessonIdAndDeletedAtIsNull(lessonId);
    }

    public List<Media> listByUploader(String email) {
        return mediaRepository.findByUploadedByAndDeletedAtIsNull(email);
    }

    public record PresignUrlWithId(
            String mediaId,
            String uploadUrl,
            String s3Key,
            long expiresInSeconds) {}
}
