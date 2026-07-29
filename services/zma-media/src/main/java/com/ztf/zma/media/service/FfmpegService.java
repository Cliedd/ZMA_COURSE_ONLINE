package com.ztf.zma.media.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.util.List;
import java.util.concurrent.TimeUnit;

/**
 * Thin wrapper around the real {@code ffmpeg}/{@code ffprobe} binaries via
 * {@link ProcessBuilder} (argument list, never a shell string, to avoid
 * injection). Binary paths are externalized the same way as other config in
 * this service (e.g. storage.local.upload-dir) so they can be pointed at a
 * non-PATH install without a code change.
 */
@Service
public class FfmpegService {

    private static final Logger log = LoggerFactory.getLogger(FfmpegService.class);

    /** Safety cap so a stuck/huge encode can't hang a worker thread forever. */
    private static final long PROCESS_TIMEOUT_MINUTES = 10;

    private final String ffmpegPath;
    private final String ffprobePath;

    public FfmpegService(
            @Value("${ffmpeg.binary-path:ffmpeg}") String ffmpegPath,
            @Value("${ffmpeg.probe-binary-path:ffprobe}") String ffprobePath) {
        this.ffmpegPath = ffmpegPath;
        this.ffprobePath = ffprobePath;
    }

    public record VideoDimensions(int width, int height) {}

    public record TranscodeResult(boolean success, int exitCode, String stderr) {}

    /**
     * Probe a video file's actual resolution with ffprobe.
     *
     * @throws IOException if ffprobe fails to run, times out, exits non-zero,
     *                      or the output can't be parsed (e.g. corrupt/invalid file).
     */
    public VideoDimensions probeResolution(Path videoFile) throws IOException {
        List<String> command = List.of(
                ffprobePath,
                "-v", "error",
                "-select_streams", "v:0",
                "-show_entries", "stream=width,height",
                "-of", "csv=s=x:p=0",
                videoFile.toAbsolutePath().toString()
        );

        ProcessResult result = run(command);
        if (result.exitCode != 0) {
            throw new IOException("ffprobe failed (exit " + result.exitCode + "): " + truncate(result.stderr));
        }

        String out = result.stdout.trim();
        // ffprobe with csv output for one stream prints e.g. "1920x1080" (possibly with trailing lines)
        String firstLine = out.lines().findFirst().orElse("");
        String[] parts = firstLine.split("x");
        if (parts.length != 2) {
            throw new IOException("Could not parse ffprobe resolution output: '" + out + "'");
        }
        try {
            int width = Integer.parseInt(parts[0].trim());
            int height = Integer.parseInt(parts[1].trim());
            if (width <= 0 || height <= 0) {
                throw new IOException("ffprobe reported non-positive dimensions: " + firstLine);
            }
            return new VideoDimensions(width, height);
        } catch (NumberFormatException ex) {
            throw new IOException("Could not parse ffprobe resolution output: '" + out + "'", ex);
        }
    }

    /**
     * Transcode {@code input} to H.264/AAC MP4, scaled so its height equals
     * {@code targetHeight} (width auto-computed, kept even for yuv420p).
     * Never throws for a normal ffmpeg failure — returns a result with
     * success=false and the captured stderr so the caller can record it
     * against the specific variant and continue with the others.
     */
    public TranscodeResult transcode(Path input, Path output, int targetHeight) {
        List<String> command = List.of(
                ffmpegPath,
                "-y",
                "-i", input.toAbsolutePath().toString(),
                "-vf", "scale=-2:" + targetHeight,
                "-c:v", "libx264",
                "-preset", "veryfast",
                "-crf", "23",
                "-c:a", "aac",
                "-movflags", "+faststart",
                output.toAbsolutePath().toString()
        );

        try {
            ProcessResult result = run(command);
            return new TranscodeResult(result.exitCode == 0, result.exitCode, result.stderr);
        } catch (IOException ex) {
            return new TranscodeResult(false, -1, "ffmpeg invocation failed: " + ex.getMessage());
        }
    }

    private record ProcessResult(int exitCode, String stdout, String stderr) {}

    private ProcessResult run(List<String> command) throws IOException {
        log.debug("Running: {}", String.join(" ", command));
        ProcessBuilder pb = new ProcessBuilder(command);
        Process process = pb.start();

        StringBuilder stdout = new StringBuilder();
        StringBuilder stderr = new StringBuilder();
        Thread stdoutReader = drainAsync(process.getInputStream(), stdout);
        Thread stderrReader = drainAsync(process.getErrorStream(), stderr);

        boolean finished;
        try {
            finished = process.waitFor(PROCESS_TIMEOUT_MINUTES, TimeUnit.MINUTES);
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            process.destroyForcibly();
            throw new IOException("Interrupted while waiting for process", ex);
        }

        if (!finished) {
            process.destroyForcibly();
            throw new IOException("Process timed out after " + PROCESS_TIMEOUT_MINUTES + " minutes: " + command.get(0));
        }

        try {
            stdoutReader.join(5000);
            stderrReader.join(5000);
        } catch (InterruptedException ignored) {
            Thread.currentThread().interrupt();
        }

        return new ProcessResult(process.exitValue(), stdout.toString(), stderr.toString());
    }

    private Thread drainAsync(InputStream stream, StringBuilder sink) {
        Thread t = new Thread(() -> {
            try (BufferedReader reader = new BufferedReader(new InputStreamReader(stream, StandardCharsets.UTF_8))) {
                String line;
                while ((line = reader.readLine()) != null) {
                    sink.append(line).append('\n');
                }
            } catch (IOException ignored) {
                // stream closed on process exit
            }
        });
        t.setDaemon(true);
        t.start();
        return t;
    }

    private String truncate(String s) {
        if (s == null) return "";
        return s.length() > 2000 ? s.substring(0, 2000) + "...[truncated]" : s;
    }
}
