package com.ztf.zma.payment.infrastructure;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * The zero-decimal-currency conversion is the single highest-stakes piece of
 * arithmetic in this whole service: get it wrong and every XAF transaction
 * either charges 100x too much or 100x too little. Covered in isolation,
 * with no network/API-key dependency.
 */
class StripeClientImplTest {

    @Test
    void xaf_isZeroDecimal_amountPassedAsIs() {
        // 15 000 XAF must become unit amount 15000, NOT 1 500 000.
        assertThat(StripeClientImpl.toStripeUnitAmount(15000.0, "xaf")).isEqualTo(15000L);
    }

    @Test
    void usd_hasTwoDecimals_amountMultipliedBy100() {
        assertThat(StripeClientImpl.toStripeUnitAmount(29.99, "usd")).isEqualTo(2999L);
    }

    @Test
    void eur_hasTwoDecimals_amountMultipliedBy100() {
        assertThat(StripeClientImpl.toStripeUnitAmount(10.0, "eur")).isEqualTo(1000L);
    }

    @Test
    void jpy_isZeroDecimal_amountPassedAsIs() {
        assertThat(StripeClientImpl.toStripeUnitAmount(5000.0, "jpy")).isEqualTo(5000L);
    }

    @Test
    void roundsToNearestUnit_forFloatingPointAmounts() {
        assertThat(StripeClientImpl.toStripeUnitAmount(19.995, "usd")).isEqualTo(2000L);
    }
}
