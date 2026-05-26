package com.ztf.zma.auth.api;

public record AuthResponse(
    String token,
    String refreshToken,
    String email,
    String role,
    String id,
    long expiresIn
) {}
