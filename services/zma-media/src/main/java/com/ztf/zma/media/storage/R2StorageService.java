package com.ztf.zma.media.storage;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.net.URI;
import java.time.Duration;

/**
 * Cloudflare R2 storage implementation (S3-compatible API).
 * Activated when storage.type=r2.
 *
 * R2 endpoint format: https://<accountId>.r2.cloudflarestorage.com
 */
@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "r2")
public class R2StorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(R2StorageService.class);

    private final S3Client   s3Client;
    private final S3Presigner presigner;
    private final String bucket;

    public R2StorageService(
            @Value("${storage.r2.account-id}") String accountId,
            @Value("${storage.r2.access-key}")  String accessKey,
            @Value("${storage.r2.secret-key}")  String secretKey,
            @Value("${storage.r2.bucket:zma-media}") String bucket) {

        this.bucket = bucket;

        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);
        String endpoint = "https://" + accountId + ".r2.cloudflarestorage.com";

        this.s3Client = S3Client.builder()
            .endpointOverride(URI.create(endpoint))
            .region(Region.of("auto"))
            .credentialsProvider(StaticCredentialsProvider.create(credentials))
            .build();

        this.presigner = S3Presigner.builder()
            .endpointOverride(URI.create(endpoint))
            .region(Region.of("auto"))
            .credentialsProvider(StaticCredentialsProvider.create(credentials))
            .build();
    }

    @Override
    public PresignedUrlResponse generatePresignedUploadUrl(String mediaId,
                                                            String fileName,
                                                            String contentType,
                                                            long sizeBytes) {
        String s3Key = "media/" + mediaId + "/" + fileName;

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
            .signatureDuration(Duration.ofHours(1))
            .putObjectRequest(r -> r.bucket(bucket).key(s3Key).contentType(contentType))
            .build();

        String uploadUrl = presigner.presignPutObject(presignRequest).url().toString();
        return new PresignedUrlResponse(uploadUrl, s3Key, 3600);
    }

    @Override
    public void confirmUpload(String s3Key) {
        // R2: object is uploaded directly by the client — no server-side action needed
        log.debug("confirmUpload: {} (R2 no-op)", s3Key);
    }

    @Override
    public String generateDownloadUrl(String s3Key, long ttlSeconds) {
        GetObjectPresignRequest presignRequest = GetObjectPresignRequest.builder()
            .signatureDuration(Duration.ofSeconds(ttlSeconds))
            .getObjectRequest(r -> r.bucket(bucket).key(s3Key))
            .build();

        return presigner.presignGetObject(presignRequest).url().toString();
    }

    @Override
    public void deleteFile(String s3Key) {
        try {
            s3Client.deleteObject(DeleteObjectRequest.builder()
                .bucket(bucket).key(s3Key).build());
            log.info("Deleted from R2: {}", s3Key);
        } catch (Exception ex) {
            log.error("Failed to delete {} from R2: {}", s3Key, ex.getMessage());
        }
    }
}
