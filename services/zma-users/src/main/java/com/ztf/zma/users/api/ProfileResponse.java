package com.ztf.zma.users.api;

import com.ztf.zma.users.domain.UserProfile;

public record ProfileResponse(
    String id,
    String email,
    String role,
    String firstName,
    String lastName,
    String bio,
    String avatarUrl,
    String phoneNumber,
    String preferredLanguage,
    String createdAt,
    String updatedAt
) {
    public static ProfileResponse from(UserProfile p) {
        return new ProfileResponse(
            p.getId(),
            p.getEmail(),
            p.getRole(),
            p.getFirstName(),
            p.getLastName(),
            p.getBio(),
            p.getAvatarUrl(),
            p.getPhoneNumber(),
            p.getPreferredLanguage(),
            p.getCreatedAt() != null ? p.getCreatedAt().toString() : null,
            p.getUpdatedAt() != null ? p.getUpdatedAt().toString() : null
        );
    }
}
