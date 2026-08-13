package com.ztf.zma.media.storage;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.S3Configuration;
import software.amazon.awssdk.services.s3.model.CORSConfiguration;
import software.amazon.awssdk.services.s3.model.CORSRule;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.GetObjectRequest;
import software.amazon.awssdk.services.s3.model.PutBucketCorsRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest;
import software.amazon.awssdk.services.s3.presigner.model.PutObjectPresignRequest;

import java.io.IOException;
import java.net.URI;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Duration;
import java.util.Arrays;
import java.util.List;

/**
 * Generic S3-compatible storage implementation (Cloudflare R2, Railway Buckets,
 * or any other S3-compatible provider). Activated when storage.type=r2.
 *
 * The endpoint is fully configurable via storage.r2.endpoint — no provider-specific
 * URL construction. Examples:
 *   - Cloudflare R2:      https://<accountId>.r2.cloudflarestorage.com
 *   - Railway Buckets:    https://t3.storageapi.dev (or whatever the bucket's
 *                         `railway bucket credentials` output reports)
 */
@Service
@ConditionalOnProperty(name = "storage.type", havingValue = "r2")
public class R2StorageService implements StorageService {

    private static final Logger log = LoggerFactory.getLogger(R2StorageService.class);

    private final S3Client    s3Client;
    private final S3Presigner presigner;
    private final S3Presigner downloadPresigner;
    private final String bucket;
    private final String corsAllowedOrigins;

    public R2StorageService(
            @Value("${storage.r2.endpoint}")         String endpoint,
            @Value("${storage.r2.public-url:}")      String publicUrl,
            @Value("${storage.r2.access-key}")       String accessKey,
            @Value("${storage.r2.secret-key}")       String secretKey,
            @Value("${storage.r2.bucket:zma-media}") String bucket,
            @Value("${cors.allowed-origins}")        String corsAllowedOrigins) {

        this.bucket = bucket;
        this.corsAllowedOrigins = corsAllowedOrigins;

        AwsBasicCredentials credentials = AwsBasicCredentials.create(accessKey, secretKey);

        this.s3Client = S3Client.builder()
            .endpointOverride(URI.create(endpoint))
            .region(Region.of("auto"))
            .credentialsProvider(StaticCredentialsProvider.create(credentials))
            .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build())
            .build();

        // Upload presigner always uses the internal S3 endpoint (path-style).
        this.presigner = S3Presigner.builder()
            .endpointOverride(URI.create(endpoint))
            .region(Region.of("auto"))
            .credentialsProvider(StaticCredentialsProvider.create(credentials))
            .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build())
            .build();

        // Download presigner uses the public bucket URL if configured so that
        // the generated presigned URL is signed against the same host the
        // browser will actually reach — avoiding the 307 redirect that would
        // invalidate the HMAC signature (the host is part of the signed string).
        // Falls back to the upload endpoint when publicUrl is not set (local dev).
        //
        // Path-style is ALWAYS enabled for the download presigner. Virtual-hosted
        // style (bucket-as-subdomain, e.g. https://<bucket>.t3.storageapi.dev/...)
        // does not work for Railway/Tigris Buckets — the bucket-name subdomain does
        // not resolve. Path-style (https://t3.storageapi.dev/<bucket>/...) is the
        // correct form for all S3-compatible providers used here, including Cloudflare
        // R2 behind a custom public URL configured in path-style mode.
        String downloadEndpoint = (publicUrl != null && !publicUrl.isBlank()) ? publicUrl : endpoint;
        this.downloadPresigner = S3Presigner.builder()
            .endpointOverride(URI.create(downloadEndpoint))
            .region(Region.of("auto"))
            .credentialsProvider(StaticCredentialsProvider.create(credentials))
            .serviceConfiguration(S3Configuration.builder().pathStyleAccessEnabled(true).build())
            .build();
    }

    /**
     * The browser uploads video bytes with a direct PUT to the presigned R2/Tigris
     * URL (see generatePresignedUploadUrl below) — that request never touches our
     * own Spring controllers, so the app-level @CrossOrigin/CorsConfigurationSource
     * on MediaController has no effect on it. Without a CORS policy configured on
     * the bucket itself, the browser's preflight OPTIONS to the storage endpoint
     * gets a 200 with no Access-Control-Allow-Origin header, so the browser blocks
     * the actual PUT — surfacing to the user as a generic "network error" with no
     * indication that the bucket, not the network, is the problem.
     *
     * Idempotently push the same allowed origins used for our own API (cors.allowed-
     * origins) onto the bucket's CORS policy at startup so direct-to-bucket uploads
     * are actually reachable from the app's real origins. Never fails startup: if
     * the storage provider rejects/doesn't support PutBucketCors, we log and move on
     * rather than crashing the service over a non-critical bootstrap step.
     */
    @PostConstruct
    void configureBucketCors() {
        List<String> origins = Arrays.stream(corsAllowedOrigins.split(","))
            .map(String::trim)
            .filter(o -> !o.isEmpty())
            .toList();
        if (origins.isEmpty()) {
            log.warn("configureBucketCors: cors.allowed-origins is empty, skipping bucket CORS setup");
            return;
        }
        try {
            CORSRule rule = CORSRule.builder()
                .allowedOrigins(origins)
                .allowedMethods("PUT", "GET", "HEAD")
                .allowedHeaders("*")
                .exposeHeaders("ETag")
                .maxAgeSeconds(3000)
                .build();
            s3Client.putBucketCors(PutBucketCorsRequest.builder()
                .bucket(bucket)
                .corsConfiguration(CORSConfiguration.builder().corsRules(rule).build())
                .build());
            log.info("Configured bucket CORS on {} for origins: {}", bucket, origins);
        } catch (Exception ex) {
            log.warn("Failed to configure bucket CORS on {} (uploads from browser origins may be blocked): {}",
                bucket, ex.getMessage());
        }
    }

    @Override
    public PresignedUrlResponse generatePresignedUploadUrl(String mediaId,
                                                            String fileName,
                                                            String contentType,
                                                            long sizeBytes) {
        String s3Key = "media/" + mediaId + "/" + fileName;

        PutObjectPresignRequest presignRequest = PutObjectPresignRequest.builder()
            .signatureDuration(Duration.ofHours(24))
            .putObjectRequest(r -> r.bucket(bucket).key(s3Key))
            .build();

        String uploadUrl = presigner.presignPutObject(presignRequest).url().toString();
        return new PresignedUrlResponse(uploadUrl, s3Key, 86400);
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

        return downloadPresigner.presignGetObject(presignRequest).url().toString();
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

    @Override
    public void downloadToLocalFile(String s3Key, Path destination) throws IOException {
        Files.createDirectories(destination.getParent());
        s3Client.getObject(GetObjectRequest.builder().bucket(bucket).key(s3Key).build(), destination);
    }

    @Override
    public String uploadFile(String mediaId, String fileName, String contentType, Path localFile) throws IOException {
        String s3Key = "media/" + mediaId + "/" + fileName;
        s3Client.putObject(
                PutObjectRequest.builder().bucket(bucket).key(s3Key).contentType(contentType).build(),
                localFile);
        return s3Key;
    }
}
