package com.ztf.zma.media.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ztf.zma.media.domain.Media;
import com.ztf.zma.media.repository.MediaRepository;
import com.ztf.zma.media.support.AbstractIntegrationTest;
import com.ztf.zma.media.support.JwtTestUtils;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.Comparator;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * End-to-end coverage of the local-storage upload-direct flow, proving:
 *  - AVATAR-purpose images get resized + re-encoded (Task 1)
 *  - non-avatar uploads (e.g. course PDFs) are completely untouched
 */
class MediaControllerAvatarUploadTest extends AbstractIntegrationTest {

    @Autowired
    private MediaRepository mediaRepository;

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final String UPLOAD_DIR = "/tmp/zma-media-test-uploads";

    @BeforeEach
    void setUp() {
        mockMvc = mockMvc();
        mediaRepository.deleteAll();
    }

    @AfterEach
    void cleanUp() throws Exception {
        Path dir = Path.of(UPLOAD_DIR);
        if (Files.exists(dir)) {
            try (var walk = Files.walk(dir)) {
                walk.sorted(Comparator.reverseOrder()).forEach(p -> {
                    try { Files.deleteIfExists(p); } catch (Exception ignored) {}
                });
            }
        }
    }

    private byte[] largeTestPng() throws Exception {
        BufferedImage image = new BufferedImage(1600, 1200, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        for (int y = 0; y < 1200; y += 5) {
            for (int x = 0; x < 1600; x += 5) {
                g.setColor(new Color((x * 3) % 256, (y * 5) % 256, (x ^ y) % 256));
                g.fillRect(x, y, 5, 5);
            }
        }
        g.dispose();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "png", baos);
        return baos.toByteArray();
    }

    @Test
    void avatarPurposeImage_isResizedAndReencodedOnDirectUpload() throws Exception {
        String token = JwtTestUtils.token("teacher@zma.test", "TEACHER");
        byte[] pngBytes = largeTestPng();

        String presignBody = """
                {"fileName":"avatar.png","contentType":"image/png","sizeBytes":%d,"purpose":"AVATAR"}
                """.formatted(pngBytes.length);

        String presignResponse = mockMvc.perform(post("/api/v1/media/presign")
                        .header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .content(presignBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String mediaId = objectMapper.readTree(presignResponse).get("mediaId").asText();

        MockMultipartFile file = new MockMultipartFile("file", "avatar.png", "image/png", pngBytes);

        mockMvc.perform(multipart("/api/v1/media/" + mediaId + "/upload-direct")
                        .file(file)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        Media saved = mediaRepository.findById(mediaId).orElseThrow();
        assertThat(saved.getStatus()).isEqualTo("READY");
        // Re-encoded to JPEG (see ImageProcessingService for why not WebP)
        assertThat(saved.getContentType()).isEqualTo("image/jpeg");
        assertThat(saved.getSize()).isLessThan((long) pngBytes.length);

        Path storedFile = Path.of(UPLOAD_DIR, mediaId, "avatar.png");
        assertThat(Files.exists(storedFile)).isTrue();
        byte[] onDisk = Files.readAllBytes(storedFile);
        assertThat(onDisk.length).isEqualTo(saved.getSize().intValue());

        BufferedImage decoded = ImageIO.read(new java.io.ByteArrayInputStream(onDisk));
        assertThat(decoded).isNotNull();
        assertThat(decoded.getWidth()).isLessThanOrEqualTo(512);
        assertThat(decoded.getHeight()).isLessThanOrEqualTo(512);
    }

    @Test
    void nonAvatarImageUpload_isNotResized() throws Exception {
        String token = JwtTestUtils.token("teacher2@zma.test", "TEACHER");
        byte[] pngBytes = largeTestPng();

        // No "purpose" field at all — this must behave exactly like before this feature existed.
        String presignBody = """
                {"fileName":"course-cover.png","contentType":"image/png","sizeBytes":%d}
                """.formatted(pngBytes.length);

        String presignResponse = mockMvc.perform(post("/api/v1/media/presign")
                        .header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .content(presignBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String mediaId = objectMapper.readTree(presignResponse).get("mediaId").asText();

        MockMultipartFile file = new MockMultipartFile("file", "course-cover.png", "image/png", pngBytes);

        mockMvc.perform(multipart("/api/v1/media/" + mediaId + "/upload-direct")
                        .file(file)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        Media saved = mediaRepository.findById(mediaId).orElseThrow();
        assertThat(saved.getContentType()).isEqualTo("image/png"); // untouched
        assertThat(saved.getSize()).isEqualTo((long) pngBytes.length); // untouched

        Path storedFile = Path.of(UPLOAD_DIR, mediaId, "course-cover.png");
        assertThat(Files.readAllBytes(storedFile)).isEqualTo(pngBytes);
    }

    @Test
    void nonImageUpload_pdfPathStillWorksUnchanged() throws Exception {
        String token = JwtTestUtils.token("teacher3@zma.test", "TEACHER");
        byte[] pdfBytes = "%PDF-1.4 fake pdf content for testing".getBytes();

        String presignBody = """
                {"fileName":"syllabus.pdf","contentType":"application/pdf","sizeBytes":%d,"purpose":"AVATAR"}
                """.formatted(pdfBytes.length);

        String presignResponse = mockMvc.perform(post("/api/v1/media/presign")
                        .header("Authorization", "Bearer " + token)
                        .contentType("application/json")
                        .content(presignBody))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();

        String mediaId = objectMapper.readTree(presignResponse).get("mediaId").asText();

        MockMultipartFile file = new MockMultipartFile("file", "syllabus.pdf", "application/pdf", pdfBytes);

        mockMvc.perform(multipart("/api/v1/media/" + mediaId + "/upload-direct")
                        .file(file)
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());

        Media saved = mediaRepository.findById(mediaId).orElseThrow();
        // purpose=AVATAR but content type isn't a resizable image type -> untouched, no crash.
        assertThat(saved.getContentType()).isEqualTo("application/pdf");
        assertThat(saved.getSize()).isEqualTo((long) pdfBytes.length);
    }
}
