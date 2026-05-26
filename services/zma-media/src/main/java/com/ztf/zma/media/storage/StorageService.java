package com.ztf.zma.media.storage;

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
}
