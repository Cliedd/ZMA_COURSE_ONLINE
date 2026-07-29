package com.ztf.zma.users.api;

import com.ztf.zma.users.domain.UserProfile;

/**
 * Public-safe view of a teacher's profile — deliberately omits email/phone.
 */
public record TeacherPublicProfileResponse(
    String id,
    String firstName,
    String lastName,
    String bio,
    String avatarUrl,
    int courseCount
) {
    public static TeacherPublicProfileResponse from(UserProfile p, int courseCount) {
        return new TeacherPublicProfileResponse(
            p.getId(),
            p.getFirstName(),
            p.getLastName(),
            p.getBio(),
            p.getAvatarUrl(),
            courseCount
        );
    }
}
