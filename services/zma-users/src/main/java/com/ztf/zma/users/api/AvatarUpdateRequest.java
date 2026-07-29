package com.ztf.zma.users.api;

/**
 * Either mediaId (resolved via zma-media's confirmed-upload URL) or a direct
 * avatarUrl may be provided; at least one is required (validated in the controller).
 */
public record AvatarUpdateRequest(
    String mediaId,
    String avatarUrl
) {}
