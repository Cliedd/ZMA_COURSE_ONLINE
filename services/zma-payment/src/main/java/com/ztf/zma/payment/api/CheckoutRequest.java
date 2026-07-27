package com.ztf.zma.payment.api;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public record CheckoutRequest(
        @JsonProperty("courseId") @NotBlank String courseId,
        @JsonProperty("promoCode") String promoCode
) {}
