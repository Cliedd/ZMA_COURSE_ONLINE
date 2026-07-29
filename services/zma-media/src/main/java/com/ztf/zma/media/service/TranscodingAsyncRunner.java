package com.ztf.zma.media.service;

import com.ztf.zma.media.infrastructure.AsyncConfig;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Separate bean from {@link TranscodingService} on purpose: Spring's @Async
 * proxying only kicks in on calls made from outside the declaring bean, so
 * dispatching from here (invoked by the controller, not by
 * TranscodingService itself) is what actually makes transcoding run on the
 * dedicated background executor instead of blocking the calling thread.
 */
@Service
public class TranscodingAsyncRunner {

    private final TranscodingService transcodingService;

    public TranscodingAsyncRunner(TranscodingService transcodingService) {
        this.transcodingService = transcodingService;
    }

    @Async(AsyncConfig.TRANSCODING_EXECUTOR)
    public void runAsync(String mediaId) {
        transcodingService.runTranscodeJob(mediaId);
    }
}
