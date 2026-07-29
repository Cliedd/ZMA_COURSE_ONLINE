package com.ztf.zma.community.api;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

/**
 * Standard Web Push subscription payload, as produced by
 * PushManager.subscribe() in the browser:
 * { endpoint, keys: { p256dh, auth } }
 */
public record PushSubscribeRequest(
        @NotBlank(message = "endpoint is required") String endpoint,
        @NotNull(message = "keys is required") @Valid Keys keys
) {
    public record Keys(
            @NotBlank(message = "keys.p256dh is required") String p256dh,
            @NotBlank(message = "keys.auth is required") String auth
    ) {}
}
