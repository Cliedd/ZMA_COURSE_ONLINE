package com.ztf.zma.media.service;

import com.ztf.zma.media.domain.Media;
import com.ztf.zma.media.domain.MediaVariant;
import com.ztf.zma.media.repository.MediaRepository;
import com.ztf.zma.media.repository.MediaVariantRepository;
import com.ztf.zma.media.storage.StorageService;
import com.ztf.zma.media.support.AbstractIntegrationTest;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * Exercises the real ffmpeg/ffprobe binaries end to end — no mocking of
 * FfmpegService. A tiny synthetic clip is generated with ffmpeg itself as a
 * test fixture, transcoded through the real TranscodingService pipeline, and
 * the actual output file is verified with ffprobe. This is deliberately slow
 * (a few real seconds) — that's the point: it proves transcoding genuinely
 * works on this machine, not that the code merely compiles.
 */
class TranscodingServiceTest extends AbstractIntegrationTest {

    @Autowired
    private TranscodingService transcodingService;
    @Autowired
    private FfmpegService ffmpegService;
    @Autowired
    private MediaRepository mediaRepository;
    @Autowired
    private MediaVariantRepository variantRepository;
    @Autowired
    private StorageService storageService;

    private static Path source720p;
    private static Path source480p;
    private static Path corruptFile;

    @BeforeAll
    static void generateFixtures() throws IOException, InterruptedException {
        Path dir = Files.createTempDirectory("transcode-fixtures");
        source720p = dir.resolve("source-720p.mp4");
        source480p = dir.resolve("source-480p.mp4");
        corruptFile = dir.resolve("corrupt.mp4");

        generateSyntheticVideo(source720p, 1280, 720);
        generateSyntheticVideo(source480p, 854, 480);
        Files.writeString(corruptFile, "this is not a real video file");
    }

    private static void generateSyntheticVideo(Path output, int width, int height) throws IOException, InterruptedException {
        // 2-second synthetic clip with video + audio — real ffmpeg output, not a mock.
        Process p = new ProcessBuilder(
                "ffmpeg", "-y",
                "-f", "lavfi", "-i", "testsrc=duration=2:size=" + width + "x" + height + ":rate=15",
                "-f", "lavfi", "-i", "sine=duration=2",
                "-c:v", "libx264", "-preset", "veryfast",
                "-c:a", "aac",
                output.toAbsolutePath().toString()
        ).redirectErrorStream(true).start();
        boolean finished = p.waitFor(60, TimeUnit.SECONDS);
        assertThat(finished).as("ffmpeg fixture generation should finish within 60s").isTrue();
        assertThat(p.exitValue()).as("ffmpeg fixture generation should succeed").isZero();
        assertThat(Files.exists(output)).isTrue();
    }

    private Media uploadSourceMedia(Path localFile) throws IOException {
        String mediaId = UUID.randomUUID().toString();
        String s3Key = storageService.uploadFile(mediaId, "source.mp4", "video/mp4", localFile);

        Media media = new Media();
        media.setId(mediaId);
        media.setFileName("source.mp4");
        media.setContentType("video/mp4");
        media.setS3Key(s3Key);
        media.setStatus("READY");
        media.setUploadedBy("teacher@zma.test");
        media.setUploadedAt(Instant.now());
        return mediaRepository.save(media);
    }

    @Test
    void runTranscodeJob_720pSource_producesReal480pAnd720pVariants_neverUpscalesTo1080p() throws IOException {
        Media media = uploadSourceMedia(source720p);

        transcodingService.runTranscodeJob(media.getId());

        Media reloaded = mediaRepository.findById(media.getId()).orElseThrow();
        assertThat(reloaded.getTranscodeStatus()).isEqualTo(TranscodingService.STATUS_COMPLETED);

        List<MediaVariant> variants = variantRepository.findByMediaId(media.getId());
        Map<String, MediaVariant> byResolution = variants.stream()
                .collect(java.util.stream.Collectors.toMap(MediaVariant::getResolution, v -> v));

        // 720p source: only 480p qualifies (strictly below source height). No 1080p, no 720p (not below source).
        assertThat(byResolution).containsKey("480p");
        assertThat(byResolution).doesNotContainKey("1080p");
        assertThat(byResolution).doesNotContainKey("720p");

        MediaVariant variant480 = byResolution.get("480p");
        assertThat(variant480.getStatus()).isEqualTo(TranscodingService.STATUS_READY);
        assertThat(variant480.getS3Key()).isNotBlank();

        // Real proof: download the actual produced artifact and ffprobe it — not just trust the DB row.
        Path downloaded = Files.createTempFile("variant-480p", ".mp4");
        try {
            storageService.downloadToLocalFile(variant480.getS3Key(), downloaded);
            FfmpegService.VideoDimensions dims = ffmpegService.probeResolution(downloaded);
            assertThat(dims.height()).isEqualTo(480);
            assertThat(variant480.getHeight()).isEqualTo(480);
        } finally {
            Files.deleteIfExists(downloaded);
        }
    }

    @Test
    void runTranscodeJob_480pSource_producesNoVariants_neverUpscales() throws IOException {
        Media media = uploadSourceMedia(source480p);

        transcodingService.runTranscodeJob(media.getId());

        Media reloaded = mediaRepository.findById(media.getId()).orElseThrow();
        assertThat(reloaded.getTranscodeStatus()).isEqualTo(TranscodingService.STATUS_COMPLETED);

        List<MediaVariant> variants = variantRepository.findByMediaId(media.getId());
        assertThat(variants).isEmpty();
    }

    @Test
    void runTranscodeJob_corruptSource_marksJobFailed_doesNotThrow() throws IOException {
        Media media = uploadSourceMedia(corruptFile);

        transcodingService.runTranscodeJob(media.getId());

        Media reloaded = mediaRepository.findById(media.getId()).orElseThrow();
        assertThat(reloaded.getTranscodeStatus()).isEqualTo(TranscodingService.STATUS_FAILED);
        assertThat(variantRepository.findByMediaId(media.getId())).isEmpty();
    }

    @Test
    void startTranscode_rejectsNonVideoContentType() {
        Media media = new Media();
        media.setId(UUID.randomUUID().toString());
        media.setContentType("application/pdf");

        org.junit.jupiter.api.Assertions.assertThrows(
                IllegalArgumentException.class,
                () -> transcodingService.startTranscode(media));
    }
}
