package com.ztf.zma.payment.api;

import jakarta.validation.constraints.NotBlank;

public record CheckoutRequest(
        @NotBlank String courseId,
        /** Optional promo code for discount */
        String promoCode
) {}
