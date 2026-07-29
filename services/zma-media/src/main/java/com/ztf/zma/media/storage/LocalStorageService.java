package com.ztf.zma.media.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

/**
 * Dev implementation — stores files on the local container filesystem at /app/uploads/.
 * Upload goes to POST /api/v1/media/{id}/upload-direct (multipart).
 * Download is served by GET /api/v1/media/{id}/file.
 *
 * Activated when storage.type=local (default).
 * PRODUCTION: replace with R2StorageService (storage.type=r2)
 */
@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "local", matchIfMissing = true)
public class LocalStorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(LocalStorageService.class);

    @Value("${storage.local.upload-dir:/app/uploads}")
    private String uploadDir;

    @Override
    public PresignedUrlResponse generatePresignedUploadUrl(String mediaId,
                                                            String fileName,
                                                            String contentType,
                                                            long sizeBytes) {
        // s3Key convention for local storage: local/{mediaId}/{fileName}
        String s3Key    = "local/" + mediaId + "/" + fileName;
        // The "upload URL" points to our own controller endpoint
        String uploadUrl = "/api/v1/media/" + mediaId + "/upload-direct";
        return new PresignedUrlResponse(uploadUrl, s3Key, 3600);
    }

    @Override
    public void confirmUpload(String s3Key) {
        // No-op: the upload-direct controller handles the file and calls confirmUpload on the service
        log.debug("[local] confirmUpload: {}", s3Key);
    }

    @Override
    public String generateDownloadUrl(String s3Key, long ttlSeconds) {
        // s3Key = "local/{mediaId}/{fileName}" — extract mediaId
        String[] parts = s3Key.split("/", 3);
        if (parts.length >= 2) {
            return "/api/v1/media/" + parts[1] + "/file";
        }
        return "/api/v1/media/files/" + s3Key;
    }

    @Override
    public void deleteFile(String s3Key) {
        log.info("[local] delete requested for {}", s3Key);
    }

    @Override
    public void downloadToLocalFile(String s3Key, Path destination) throws IOException {
        // s3Key = "local/{mediaId}/{fileName}"
        String[] parts = s3Key.split("/", 3);
        if (parts.length < 3 || !"local".equals(parts[0])) {
            throw new IOException("Unrecognized local s3Key: " + s3Key);
        }
        Path source = Paths.get(uploadDir, parts[1], parts[2]);
        Files.createDirectories(destination.getParent());
        Files.copy(source, destination, StandardCopyOption.REPLACE_EXISTING);
    }

    @Override
    public String uploadFile(String mediaId, String fileName, String contentType, Path localFile) throws IOException {
        String s3Key = "local/" + mediaId + "/" + fileName;
        Path dest = Paths.get(uploadDir, mediaId, fileName);
        Files.createDirectories(dest.getParent());
        Files.copy(localFile, dest, StandardCopyOption.REPLACE_EXISTING);
        return s3Key;
    }
}
