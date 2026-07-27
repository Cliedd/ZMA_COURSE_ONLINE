package com.ztf.zma.media.api;

import com.ztf.zma.media.domain.Media;
import com.ztf.zma.media.service.MediaService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
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

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
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
        Path dir  = Paths.get("/app/uploads", id);
        Files.createDirectories(dir);
        Path dest = dir.resolve(media.getFileName());
        file.transferTo(dest.toFile());
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
        Path filePath = Paths.get("/app/uploads", parts[1], parts[2]);
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
     * Restricted to the uploader or an ADMIN/TEACHER — see MediaService#getDownloadUrl
     * for the documented limitation around enrolled-student access.
     */
    @Operation(summary = "Get a time-limited download URL", description = "Requires the caller to own the media or hold an ADMIN/TEACHER role.")
    @GetMapping("/{id}/url")
    public Map<String, String> getDownloadUrl(@PathVariable String id, Authentication auth) {
        return Map.of("url", mediaService.getDownloadUrl(id, auth.getName(), getRole(auth)));
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
        @Positive long sizeBytes
) {}
