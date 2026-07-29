package com.ztf.zma.payment.domain;

/**
 * Real payment rails wired for checkout. STRIPE_CARD and STRIPE_PAYPAL both
 * go through Stripe Checkout (hosted page — card/PayPal details never touch
 * our servers, keeping this app out of PCI SAQ D scope). CINETPAY covers
 * Orange Money and other mobile-money operators supported in CinetPay's
 * hosted checkout for the platform's target markets.
 */
public enum PaymentProvider {
    STRIPE_CARD,
    STRIPE_PAYPAL,
    CINETPAY
}
