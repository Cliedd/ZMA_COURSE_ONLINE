package com.ztf.zma.media.storage;

import java.io.IOException;
import java.nio.file.Path;

/**
 * Storage abstraction.
 * Local dev: LocalStorageService — stores files on disk, serves via /api/v1/media/{id}/file
 * Production: R2StorageService  — Cloudflare R2 / AWS S3 presigned URLs
 */
public interface StorageService {

    /**
     * @param mediaId    pre-generated Media entity ID (used by local impl for upload URL)
     * @param fileName   original file name
     * @param contentType MIME type
     * @param sizeBytes  file size in bytes
     */
    PresignedUrlResponse generatePresignedUploadUrl(String mediaId,
                                                     String fileName,
                                                     String contentType,
                                                     long sizeBytes);

    /** Called after client finishes uploading (no-op for local storage). */
    void confirmUpload(String s3Key);

    /** Return a URL clients can use to stream/download the file. */
    String generateDownloadUrl(String s3Key, long ttlSeconds);

    /** Permanently remove the file from storage. */
    void deleteFile(String s3Key);

    /**
     * Download the object identified by {@code s3Key} to a local file at
     * {@code destination}, overwriting it if present. Needed by operations
     * (e.g. ffmpeg transcoding) that must operate on real local files
     * regardless of whether the active backend is local disk or remote
     * object storage (R2/S3).
     */
    void downloadToLocalFile(String s3Key, Path destination) throws IOException;

    /**
     * Upload a local file as a new object and return its storage key.
     * Used to persist derived artifacts (e.g. transcoded video variants)
     * back through the same storage abstraction used for original uploads.
     */
    String uploadFile(String mediaId, String fileName, String contentType, Path localFile) throws IOException;
}
