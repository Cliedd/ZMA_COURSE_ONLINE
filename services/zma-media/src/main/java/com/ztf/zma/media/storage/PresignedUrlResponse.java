package com.ztf.zma.media.storage;

public record PresignedUrlResponse(
        String uploadUrl,
        String s3Key,
        long expiresInSeconds
) {}
