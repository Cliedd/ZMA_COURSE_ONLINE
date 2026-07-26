package com.ztf.zma.auth.api;

import com.ztf.zma.auth.domain.User;

import java.time.Instant;

/**
 * Admin-facing user projection — deliberately excludes the password hash.
 */
public record UserSummary(
        String id,
        String email,
        String role,
        String provider,
        boolean suspended,
        Instant createdAt
) {
    public static UserSummary from(User user) {
        return new UserSummary(
                user.getId(),
                user.getEmail(),
                user.getRole(),
                user.getProvider(),
                user.isSuspended(),
                user.getCreatedAt()
        );
    }
}
