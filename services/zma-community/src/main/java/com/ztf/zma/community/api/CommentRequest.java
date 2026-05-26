package com.ztf.zma.community.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CommentRequest(
        @NotBlank String lessonId,
        @NotBlank @Size(max = 2000) String content
) {}
