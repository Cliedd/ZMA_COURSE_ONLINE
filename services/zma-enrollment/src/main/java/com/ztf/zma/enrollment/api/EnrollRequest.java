package com.ztf.zma.enrollment.api;

import jakarta.validation.constraints.NotBlank;

public record EnrollRequest(
        @NotBlank String courseId,
        String courseTitle,
        String courseLevel
) {}
