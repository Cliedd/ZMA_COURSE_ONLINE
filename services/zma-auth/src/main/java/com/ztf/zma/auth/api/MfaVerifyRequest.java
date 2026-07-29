package com.ztf.zma.auth.api;

import jakarta.validation.constraints.NotBlank;

/**
 * Single endpoint, two uses, disambiguated by whether challengeToken is present:
 *  - challengeToken present  → completing a login that was paused for MFA
 *    (unauthenticated call; challengeToken proves the password step already
 *    succeeded).
 *  - challengeToken absent   → confirming a fresh /mfa/setup (authenticated
 *    call; the current user's pending secret is what gets confirmed).
 */
public record MfaVerifyRequest(
    String challengeToken,
    @NotBlank String code
) {}
