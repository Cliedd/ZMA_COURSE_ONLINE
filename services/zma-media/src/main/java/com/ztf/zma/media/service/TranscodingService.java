package com.ztf.zma.media.service;

import com.ztf.zma.media.domain.Media;
import com.ztf.zma.media.domain.MediaVariant;
import com.ztf.zma.media.repository.MediaRepository;
import com.ztf.zma.media.repository.MediaVariantRepository;
import com.ztf.zma.media.storage.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Orchestrates asynchronous video transcoding: probes the source resolution,
 * transcodes to every target resolution strictly below it (never upscales),
 * and persists each result as a {@link MediaVariant} through the existing
 * {@link StorageService} abstraction (works for both local disk and R2).
 */
@Service
public class TranscodingService {

    private static final Logger log = LoggerFactory.getLogger(TranscodingService.class);

    /** height -> label, ordered highest first. Only targets strictly below the source height are attempted. */
    private static final Map<Integer, String> TARGET_HEIGHTS = new LinkedHashMap<>();
    static {
        TARGET_HEIGHTS.put(1080, "1080p");
        TARGET_HEIGHTS.put(720, "720p");
        TARGET_HEIGHTS.put(480, "480p");
    }

    public static final String STATUS_PENDING = "PENDING";
    public static final String STATUS_PROCESSING = "PROCESSING";
    public static final String STATUS_READY = "READY";
    public static final String STATUS_FAILED = "FAILED";
    public static final String STATUS_COMPLETED = "COMPLETED";

    private final MediaRepository mediaRepository;
    private final MediaVariantRepository variantRepository;
    private final StorageService storageService;
    private final FfmpegService ffmpegService;

    @Value("${media.transcode.temp-dir:${java.io.tmpdir}/zma-media-transcode}")
    private String tempDirBase;

    public TranscodingService(MediaRepository mediaRepository,
                               MediaVariantRepository variantRepository,
                               StorageService storageService,
                               FfmpegService ffmpegService) {
        this.mediaRepository = mediaRepository;
        this.variantRepository = variantRepository;
        this.storageService = storageService;
        this.ffmpegService = ffmpegService;
    }

    /**
     * Validates and marks the job PENDING synchronously (so a client polling
     * right away sees a real status). Does NOT itself dispatch the background
     * work — callers (the controller) must do that via a separate bean
     * ({@code TranscodingAsyncRunner}) so the @Async proxy is actually
     * invoked from outside this bean (a same-bean self-invocation would
     * silently run synchronously and defeat "returns immediately").
     */
    @Transactional
    public Media startTranscode(Media media) {
        if (media.getContentType() == null || !media.getContentType().toLowerCase().startsWith("video/")) {
            throw new IllegalArgumentException("Transcoding is only supported for video/* content types");
        }
        media.setTranscodeStatus(STATUS_PENDING);
        return mediaRepository.save(media);
    }

    /**
     * The actual synchronous job body — separated from {@link #transcodeAsync}
     * so tests can invoke it directly (deterministically, without racing a
     * background thread) while production code still goes through @Async.
     */
    public void runTranscodeJob(String mediaId) {
        Media media = mediaRepository.findById(mediaId).orElse(null);
        if (media == null) {
            log.warn("Transcode job aborted: media {} no longer exists", mediaId);
            return;
        }

        media.setTranscodeStatus(STATUS_PROCESSING);
        mediaRepository.save(media);

        Path jobDir = Path.of(tempDirBase, mediaId);
        Path sourceFile = jobDir.resolve("source" + extensionOf(media.getFileName()));

        try {
            Files.createDirectories(jobDir);
            storageService.downloadToLocalFile(media.getS3Key(), sourceFile);

            FfmpegService.VideoDimensions source = ffmpegService.probeResolution(sourceFile);
            log.info("Transcode job {}: source resolution {}x{}", mediaId, source.width(), source.height());

            List<Integer> qualifyingHeights = TARGET_HEIGHTS.keySet().stream()
                    .filter(h -> h < source.height())
                    .sorted(Comparator.reverseOrder())
                    .toList();

            for (Integer targetHeight : qualifyingHeights) {
                transcodeOneVariant(media, sourceFile, jobDir, targetHeight);
            }

            media.setTranscodeStatus(STATUS_COMPLETED);
            mediaRepository.save(media);
        } catch (IOException ex) {
            // Source couldn't even be read/probed (corrupt/invalid file, download failure, ...).
            log.error("Transcode job {} failed before any variant could run: {}", mediaId, ex.getMessage());
            media.setTranscodeStatus(STATUS_FAILED);
            mediaRepository.save(media);
        } finally {
            deleteQuietly(jobDir);
        }
    }

    private void transcodeOneVariant(Media media, Path sourceFile, Path jobDir, int targetHeight) {
        String resolution = TARGET_HEIGHTS.get(targetHeight);

        MediaVariant variant = new MediaVariant();
        variant.setMediaId(media.getId());
        variant.setResolution(resolution);
        variant.setStatus(STATUS_PROCESSING);
        variant = variantRepository.save(variant);

        Path outputFile = jobDir.resolve("variant-" + resolution + ".mp4");
        try {
            FfmpegService.TranscodeResult result = ffmpegService.transcode(sourceFile, outputFile, targetHeight);

            if (!result.success()) {
                variant.setStatus(STATUS_FAILED);
                variant.setErrorMessage(truncate(result.stderr()));
                variantRepository.save(variant);
                log.warn("Transcode variant {} ({}) failed for media {}: exit={} stderr={}",
                        variant.getId(), resolution, media.getId(), result.exitCode(), truncate(result.stderr()));
                return;
            }

            FfmpegService.VideoDimensions outDims = ffmpegService.probeResolution(outputFile);
            String fileName = baseName(media.getFileName()) + "_" + resolution + ".mp4";
            String s3Key = storageService.uploadFile(media.getId(), fileName, "video/mp4", outputFile);

            variant.setWidth(outDims.width());
            variant.setHeight(outDims.height());
            variant.setS3Key(s3Key);
            variant.setStatus(STATUS_READY);
            variantRepository.save(variant);
        } catch (IOException ex) {
            variant.setStatus(STATUS_FAILED);
            variant.setErrorMessage(truncate(ex.getMessage()));
            variantRepository.save(variant);
            log.warn("Transcode variant {} ({}) failed for media {}: {}",
                    variant.getId(), resolution, media.getId(), ex.getMessage());
        } finally {
            deleteQuietly(outputFile);
        }
    }

    public List<MediaVariant> listVariants(String mediaId) {
        return variantRepository.findByMediaId(mediaId);
    }

    private String extensionOf(String fileName) {
        if (fileName == null) return "";
        int idx = fileName.lastIndexOf('.');
        return idx >= 0 ? fileName.substring(idx) : "";
    }

    private String baseName(String fileName) {
        if (fileName == null) return "video";
        int idx = fileName.lastIndexOf('.');
        return idx >= 0 ? fileName.substring(0, idx) : fileName;
    }

    private String truncate(String s) {
        if (s == null) return null;
        return s.length() > 1000 ? s.substring(0, 1000) + "...[truncated]" : s;
    }

    private void deleteQuietly(Path path) {
        try {
            if (Files.isDirectory(path)) {
                try (var walk = Files.walk(path)) {
                    walk.sorted(Comparator.reverseOrder()).forEach(p -> {
                        try { Files.deleteIfExists(p); } catch (IOException ignored) {}
                    });
                }
            } else {
                Files.deleteIfExists(path);
            }
        } catch (IOException ex) {
            log.debug("Cleanup failed for {}: {}", path, ex.getMessage());
        }
    }
}
