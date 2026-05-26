package com.ztf.zma.media.api;

import com.ztf.zma.media.domain.Media;
import com.ztf.zma.media.service.MediaService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
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
    @PatchMapping("/{id}/confirm")
    public Media confirmUpload(@PathVariable String id) {
        return mediaService.confirmUpload(id);
    }

    /**
     * Direct multipart upload endpoint — used in local dev instead of S3 presigned PUT.
     * The LocalStorageService returns this URL as the "presigned" upload URL.
     */
    @PostMapping(value = "/{id}/upload-direct", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Media uploadDirect(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file) throws IOException {
        Media media = mediaService.getById(id);
        Path dir  = Paths.get("/app/uploads", id);
        Files.createDirectories(dir);
        Path dest = dir.resolve(media.getFileName());
        file.transferTo(dest.toFile());
        return mediaService.confirmUpload(id);
    }

    /**
     * Serve a locally stored file — used in local dev to stream uploaded videos/images.
     * URL pattern: /api/v1/media/{id}/file
     */
    @GetMapping("/{id}/file")
    public ResponseEntity<Resource> serveFile(@PathVariable String id) {
        Media media = mediaService.getById(id);
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
    @PatchMapping("/{id}/attach")
    public Media attach(@PathVariable String id,
                        @RequestBody Map<String, String> body) {
        return mediaService.attach(id, body.get("courseId"), body.get("lessonId"));
    }

    /** Get media metadata */
    @GetMapping("/{id}")
    public Media getMediaMetadata(@PathVariable String id) {
        return mediaService.getById(id);
    }

    /** Get a time-limited download/CDN URL */
    @GetMapping("/{id}/url")
    public Map<String, String> getDownloadUrl(@PathVariable String id) {
        return Map.of("url", mediaService.getDownloadUrl(id));
    }

    /** Soft-delete: removes from storage and marks deleted */
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMedia(@PathVariable String id, Authentication auth) {
        mediaService.deleteMedia(id, auth.getName(), getRole(auth));
    }

    /** List media — filter by courseId or lessonId */
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
