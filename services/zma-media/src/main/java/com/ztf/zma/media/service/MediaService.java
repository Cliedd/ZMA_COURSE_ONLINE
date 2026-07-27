package com.ztf.zma.media.service;

import com.ztf.zma.media.domain.Media;
import com.ztf.zma.media.repository.MediaRepository;
import com.ztf.zma.media.storage.PresignedUrlResponse;
import com.ztf.zma.media.storage.StorageService;
import org.springframework.security.access.AccessDeniedException;
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
    public Media confirmUpload(String mediaId, String requestingUser, String role) {
        Media media = getById(mediaId);
        requireAccess(media, requestingUser, role);
        storageService.confirmUpload(media.getS3Key());
        media.setStatus("READY");
        return mediaRepository.save(media);
    }

    /** Attach media to a course and/or lesson. Only the uploader (or a teacher/admin) may attach. */
    @Transactional
    public Media attach(String mediaId, String courseId, String lessonId,
                         String requestingUser, String role) {
        Media media = getById(mediaId);
        requireAccess(media, requestingUser, role);
        if (courseId != null) media.setCourseId(courseId);
        if (lessonId != null) media.setLessonId(lessonId);
        return mediaRepository.save(media);
    }

    /**
     * Generate a time-limited CDN/download URL.
     *
     * Authorization: the requesting user must be the uploader, or hold the
     * TEACHER/ADMIN role. NOTE: this service does not have visibility into
     * course-enrollment records (owned by zma-enrollment), so a student who is
     * genuinely enrolled in the course a media item is attached to but who did
     * not upload it will currently be denied. Properly supporting "enrolled
     * students can stream course media" requires either (a) an inter-service
     * call/token claim asserting enrollment, or (b) embedding the caller's
     * enrolled course IDs in the JWT. This is an architectural decision left
     * for the team — see audit report.
     */
    public String getDownloadUrl(String mediaId, String requestingUser, String role) {
        Media media = getById(mediaId);
        requireAccess(media, requestingUser, role);
        if (!"READY".equals(media.getStatus())) {
            throw new RuntimeException("Media is not ready");
        }
        return storageService.generateDownloadUrl(media.getS3Key(), 3600);
    }

    /** Get media metadata, enforcing the same ownership/role check as downloads. */
    public Media getByIdForUser(String mediaId, String requestingUser, String role) {
        Media media = getById(mediaId);
        requireAccess(media, requestingUser, role);
        return media;
    }

    /** Throws if the requesting user is neither the uploader nor an ADMIN/TEACHER. */
    private void requireAccess(Media media, String requestingUser, String role) {
        boolean isOwner = media.getUploadedBy() != null && media.getUploadedBy().equals(requestingUser);
        boolean isPrivileged = "ADMIN".equals(role) || "TEACHER".equals(role);
        if (!isOwner && !isPrivileged) {
            throw new AccessDeniedException("Access denied");
        }
    }

    /** Soft-delete: sets deletedAt and deletes the file from storage */
    @Transactional
    public void deleteMedia(String mediaId, String requestingUser, String role) {
        Media media = getById(mediaId);
        requireAccess(media, requestingUser, role);
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
