package com.ztf.zma.users.api;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record InternalCreateRequest(
    @NotBlank String id,
    @NotBlank @Email String email,
    String role
) {}
