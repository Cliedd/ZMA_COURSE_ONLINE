package com.ztf.zma.auth.api;

/**
 * Returned by /login instead of AuthResponse when the account has MFA
 * enabled: no access/refresh tokens are issued until /mfa/verify succeeds
 * with the matching challengeToken + code.
 */
public record MfaChallengeResponse(
    boolean mfaRequired,
    String challengeToken
) {}
