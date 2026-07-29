package com.ztf.zma.payment.infrastructure;

import com.ztf.zma.payment.domain.PaymentProvider;

public interface StripeClient {

    record CheckoutSession(String sessionId, String checkoutUrl) {}

    /**
     * Creates a real Stripe Checkout Session (hosted page — card or PayPal
     * details are entered on Stripe's domain, never ours).
     *
     * @param paymentId   our Payment.id — set as client_reference_id so the
     *                    webhook can find the right row without trusting
     *                    anything the browser reports back
     * @param provider    STRIPE_CARD or STRIPE_PAYPAL — selects payment_method_types
     * @param amount      amount in major currency units (e.g. 15000.0 for 15 000 XAF,
     *                    29.99 for $29.99) — the implementation is responsible for
     *                    Stripe's zero-decimal-currency conversion rules
     * @param currency    ISO 4217, e.g. "usd", "xaf"
     * @param productName shown on the Stripe checkout page
     */
    CheckoutSession createCheckoutSession(String paymentId, PaymentProvider provider,
                                          double amount, String currency, String productName);
}
