package com.ztf.zma.media.service;

import org.junit.jupiter.api.Test;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.ByteArrayOutputStream;
import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

/**
 * Pure unit tests for the avatar image resize/re-encode pipeline — no Spring context.
 */
class ImageProcessingServiceTest {

    private final ImageProcessingService service = new ImageProcessingService();

    private byte[] generatePng(int width, int height) throws IOException {
        BufferedImage image = new BufferedImage(width, height, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = image.createGraphics();
        // Paint some noise-ish content so PNG compression can't trivially shrink a blank image
        // to something misleadingly tiny — real photos don't compress like a solid color.
        for (int y = 0; y < height; y += 4) {
            for (int x = 0; x < width; x += 4) {
                g.setColor(new Color((x * 7) % 256, (y * 13) % 256, (x + y) % 256));
                g.fillRect(x, y, 4, 4);
            }
        }
        g.dispose();
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        ImageIO.write(image, "png", baos);
        return baos.toByteArray();
    }

    @Test
    void resizeForAvatar_shrinksLargeImageToMaxDimension() throws IOException {
        byte[] original = generatePng(2000, 1000);

        ImageProcessingService.ProcessedImage result = service.resizeForAvatar(original);

        assertThat(result.width()).isLessThanOrEqualTo(512);
        assertThat(result.height()).isLessThanOrEqualTo(512);
        // Aspect ratio 2:1 preserved
        assertThat(result.width()).isEqualTo(512);
        assertThat(result.height()).isEqualTo(256);
        assertThat(result.contentType()).isEqualTo("image/jpeg");
    }

    @Test
    void resizeForAvatar_producesSmallerByteSizeThanOriginal() throws IOException {
        byte[] original = generatePng(2000, 2000);

        ImageProcessingService.ProcessedImage result = service.resizeForAvatar(original);

        assertThat(result.bytes().length).isLessThan(original.length);
        // Sanity: the output is actually decodable as a real image of the expected size.
        BufferedImage decoded = ImageIO.read(new java.io.ByteArrayInputStream(result.bytes()));
        assertThat(decoded).isNotNull();
        assertThat(decoded.getWidth()).isEqualTo(512);
        assertThat(decoded.getHeight()).isEqualTo(512);
    }

    @Test
    void resizeForAvatar_neverUpscalesSmallImages() throws IOException {
        byte[] original = generatePng(100, 50);

        ImageProcessingService.ProcessedImage result = service.resizeForAvatar(original);

        assertThat(result.width()).isEqualTo(100);
        assertThat(result.height()).isEqualTo(50);
    }

    @Test
    void resizeForAvatar_rejectsUndecodableBytes() {
        byte[] garbage = "not an image".getBytes();
        assertThatThrownBy(() -> service.resizeForAvatar(garbage))
                .isInstanceOf(IOException.class);
    }

    @Test
    void isResizable_acceptsKnownImageTypesOnly() {
        assertThat(service.isResizable("image/jpeg")).isTrue();
        assertThat(service.isResizable("image/png")).isTrue();
        assertThat(service.isResizable("image/webp")).isTrue();
        assertThat(service.isResizable("video/mp4")).isFalse();
        assertThat(service.isResizable("application/pdf")).isFalse();
        assertThat(service.isResizable(null)).isFalse();
    }
}
