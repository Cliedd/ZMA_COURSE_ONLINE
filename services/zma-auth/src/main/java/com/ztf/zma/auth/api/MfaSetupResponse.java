package com.ztf.zma.auth.api;

/**
 * Response for POST /mfa/setup. The raw secret is included so the frontend
 * can render/offer it as a fallback if QR scanning isn't available, but it
 * is never returned again after this call (it becomes "pending" on the user
 * until confirmed via /mfa/verify, at which point it is only ever read
 * server-side).
 */
public record MfaSetupResponse(
    String secret,
    String otpAuthUri,
    String issuer,
    String account
) {}
