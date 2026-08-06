package com.ztf.zma.media.api;

import com.ztf.zma.media.domain.Media;
import com.ztf.zma.media.domain.MediaVariant;
import com.ztf.zma.media.service.MediaService;
import com.ztf.zma.media.service.TranscodingAsyncRunner;
import com.ztf.zma.media.service.TranscodingService;
import com.ztf.zma.media.storage.StorageService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/media")
public class MediaController {

    private final MediaService mediaService;
    private final TranscodingService transcodingService;
    private final TranscodingAsyncRunner transcodingAsyncRunner;
    private final StorageService storageService;

    /** Base directory for locally stored files. Configurable so tests don't need to write to /app. */
    @Value("${storage.local.upload-dir:/app/uploads}")
    private String uploadDir;

    public MediaController(MediaService mediaService, TranscodingService transcodingService,
                            TranscodingAsyncRunner transcodingAsyncRunner, StorageService storageService) {
        this.mediaService = mediaService;
        this.transcodingService = transcodingService;
        this.transcodingAsyncRunner = transcodingAsyncRunner;
        this.storageService = storageService;
    }

    /** Request a presigned upload URL */
    @Operation(summary = "Request a presigned upload URL",
            description = "Validates content type and declared size against a whitelist before generating a time-limited presigned URL.")
    @PostMapping("/presign")
    @ResponseStatus(HttpStatus.CREATED)
    public MediaService.PresignUrlWithId requestUpload(
            @Valid @RequestBody MediaUploadRequest request,
            Authentication auth) {
        return mediaService.requestUpload(
                request.fileName(),
                request.contentType(),
                request.sizeBytes(),
                request.purpose(),
                auth.getName());
    }

    /** Confirm that the client successfully uploaded the file (used for R2/S3 presigned uploads) */
    @Operation(summary = "Confirm a completed upload", description = "Only the uploader (or an ADMIN/TEACHER) may confirm.")
    @PatchMapping("/{id}/confirm")
    public Media confirmUpload(@PathVariable String id, Authentication auth) {
        return mediaService.confirmUpload(id, auth.getName(), getRole(auth));
    }

    /**
     * Direct multipart upload endpoint — used in local dev instead of S3 presigned PUT.
     * The LocalStorageService returns this URL as the "presigned" upload URL.
     * Only the user who requested the presigned URL (or an ADMIN/TEACHER) may upload the bytes.
     */
    @Operation(summary = "Direct multipart upload (local dev only)")
    @PostMapping(value = "/{id}/upload-direct", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Media uploadDirect(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file,
            Authentication auth) throws IOException {
        Media media = mediaService.getByIdForUser(id, auth.getName(), getRole(auth));
        Path dir  = Paths.get(uploadDir, id);
        Files.createDirectories(dir);
        Path dest = dir.resolve(media.getFileName());
        file.transferTo(dest.toFile());
        // Avatar-purpose images get resized/re-encoded here; everything else
        // (course videos, PDFs, non-avatar images, ...) is left untouched.
        mediaService.processAvatarUploadIfApplicable(media, dest);
        return mediaService.confirmUpload(id, auth.getName(), getRole(auth));
    }

    /**
     * Serve a locally stored file — used in local dev to stream uploaded videos/images.
     * URL pattern: /api/v1/media/{id}/file
     * Requires the caller to be the uploader or an ADMIN/TEACHER (see MediaService#getByIdForUser).
     */
    @Operation(summary = "Stream a locally stored file (local dev only)")
    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> serveFile(@PathVariable String id, Authentication auth) {
        Media media = mediaService.getByIdForUser(id, auth.getName(), getRole(auth));
        String s3Key = media.getS3Key();
        // s3Key = "local/{mediaId}/{fileName}"
        String[] parts = s3Key.split("/", 3);
        if (parts.length < 3 || !"local".equals(parts[0])) {
            return ResponseEntity.notFound().build();
        }
        Path filePath = Paths.get(uploadDir, parts[1], parts[2]);
        Resource resource = new FileSystemResource(filePath);
        if (!resource.exists()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, media.getContentType())
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + media.getFileName() + "\"")
                .body(resource);
    }

    /** Attach media to a course and/or lesson */
    @Operation(summary = "Attach media to a course/lesson", description = "Only the uploader (or an ADMIN/TEACHER) may attach.")
    @PatchMapping("/{id}/attach")
    public Media attach(@PathVariable String id,
                        @RequestBody Map<String, String> body,
                        Authentication auth) {
        return mediaService.attach(id, body.get("courseId"), body.get("lessonId"), auth.getName(), getRole(auth));
    }

    /** Get media metadata. Restricted to the uploader or an ADMIN/TEACHER. */
    @Operation(summary = "Get media metadata")
    @GetMapping("/{id}")
    public Media getMediaMetadata(@PathVariable String id, Authentication auth) {
        return mediaService.getByIdForUser(id, auth.getName(), getRole(auth));
    }

    /**
     * Get a time-limited download/CDN URL.
     * Allowed for the uploader, an ADMIN/TEACHER, or a STUDENT genuinely enrolled
     * (per zma-enrollment) in the course this media belongs to — see
     * MediaService#getDownloadUrl. The inbound Authorization header is forwarded
     * as-is to zma-enrollment so the enrollment check runs as the original caller.
     */
    @Operation(summary = "Get a time-limited download URL", description = "Requires the caller to own the media, hold an ADMIN/TEACHER role, or be enrolled in the media's course.")
    @GetMapping("/{id}/url")
    public Map<String, String> getDownloadUrl(@PathVariable String id, Authentication auth,
                                               @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authorizationHeader) {
        return Map.of("url", mediaService.getDownloadUrl(id, auth.getName(), getRole(auth), authorizationHeader));
    }

    /** Soft-delete: removes from storage and marks deleted */
    @Operation(summary = "Delete media", description = "Only the uploader (or an ADMIN/TEACHER) may delete.")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMedia(@PathVariable String id, Authentication auth) {
        mediaService.deleteMedia(id, auth.getName(), getRole(auth));
    }

    /**
     * List media — filter by courseId or lessonId.
     * NOTE: listing by courseId/lessonId does not currently verify the caller
     * is enrolled in that course (same architectural gap documented on
     * MediaService#getDownloadUrl) — it returns metadata only (no download
     * URLs), so the practical exposure is limited to fileName/contentType/size,
     * but a stricter deployment should gate this too once enrollment data is
     * available to this service.
     */
    @Operation(summary = "List media", description = "Filter by courseId or lessonId, or list the caller's own uploads.")
    @GetMapping
    public List<Media> listMedia(
            @RequestParam(required = false) String courseId,
            @RequestParam(required = false) String lessonId,
            Authentication auth) {
        if (courseId != null)  return mediaService.listByCourse(courseId);
        if (lessonId != null)  return mediaService.listByLesson(lessonId);
        return mediaService.listByUploader(auth.getName());
    }

    /**
     * Trigger asynchronous H.264/AAC MP4 transcoding of a video into 1080p/720p/480p
     * variants (skipping any target at or above the source's actual resolution).
     * Restricted the same way as other mutating operations on this media item:
     * uploader (course owner/TEACHER) or ADMIN — see MediaService#requireAccess.
     * Returns immediately; poll GET /{id}/variants for progress/results.
     */
    @Operation(summary = "Transcode a video into multiple resolutions",
            description = "202 Accepted — runs asynchronously. Only valid for video/* content types.")
    @PostMapping("/transcode/{fileId}")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public Media transcode(@PathVariable String fileId, Authentication auth) {
        Media media = mediaService.getByIdForUser(fileId, auth.getName(), getRole(auth));
        Media pending = transcodingService.startTranscode(media);
        transcodingAsyncRunner.runAsync(pending.getId());
        return pending;
    }

    /** List transcoded variants (and their availability) for a media item. */
    @Operation(summary = "List transcoded video variants", description = "Requires the caller to own the media or hold an ADMIN/TEACHER role.")
    @GetMapping("/{id}/variants")
    public List<VariantResponse> listVariants(@PathVariable String id, Authentication auth) {
        Media media = mediaService.getByIdForUser(id, auth.getName(), getRole(auth));
        return transcodingService.listVariants(media.getId()).stream()
                .map(v -> new VariantResponse(
                        v.getId(),
                        v.getResolution(),
                        v.getWidth(),
                        v.getHeight(),
                        v.getStatus(),
                        "READY".equals(v.getStatus()) ? storageService.generateDownloadUrl(v.getS3Key(), 3600) : null,
                        v.getErrorMessage()))
                .toList();
    }

    private String getRole(Authentication auth) {
        return auth.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .filter(a -> a.startsWith("ROLE_"))
            .map(a -> a.substring(5))
            .findFirst().orElse("STUDENT");
    }
}

record MediaUploadRequest(
        @NotBlank String fileName,
        @NotBlank String contentType,
        @Positive long sizeBytes,
        /** Optional upload purpose hint, e.g. "AVATAR" — see MediaService#PURPOSE_AVATAR. */
        String purpose
) {}

record VariantResponse(
        String id,
        String resolution,
        Integer width,
        Integer height,
        String status,
        String url,
        String errorMessage
) {}
