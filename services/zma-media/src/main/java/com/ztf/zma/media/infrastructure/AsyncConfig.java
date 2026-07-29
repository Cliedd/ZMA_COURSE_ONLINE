package com.ztf.zma.media.infrastructure;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

/**
 * Dedicated background executor for long-running work (currently: video
 * transcoding) so it never ties up Tomcat's request-handling threads. This
 * service has no job-queue infrastructure (no SQS/Kafka/etc.), so a small
 * in-process pool is the pragmatic choice — jobs are triggered via @Async
 * and survive only for the life of the JVM, which is acceptable for this
 * feature's scope.
 */
@Configuration
@EnableAsync
public class AsyncConfig {

    public static final String TRANSCODING_EXECUTOR = "transcodingExecutor";

    @Bean(name = TRANSCODING_EXECUTOR)
    public Executor transcodingExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(4);
        executor.setQueueCapacity(50);
        executor.setThreadNamePrefix("transcode-");
        executor.initialize();
        return executor;
    }
}
