package com.ztf.zma.users.api;

import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
    String firstName,
    String lastName,
    @Size(max = 1000) String bio,
    String avatarUrl,
    String phoneNumber,
    String preferredLanguage
) {}
