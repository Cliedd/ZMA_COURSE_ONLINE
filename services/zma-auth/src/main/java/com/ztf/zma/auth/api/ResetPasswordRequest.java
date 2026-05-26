package com.ztf.zma.auth.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ResetPasswordRequest(
    @NotBlank String resetToken,
    @NotBlank @Size(min = 8) String newPassword
) {}
