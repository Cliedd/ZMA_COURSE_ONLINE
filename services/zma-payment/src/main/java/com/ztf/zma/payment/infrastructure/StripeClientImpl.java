package com.ztf.zma.payment.infrastructure;

import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import com.ztf.zma.payment.domain.PaymentProvider;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.Locale;
import java.util.Set;

@Component
public class StripeClientImpl implements StripeClient {

    /**
     * Currencies Stripe treats as having no minor unit — amounts are passed
     * as-is, never multiplied by 100. https://docs.stripe.com/currencies#zero-decimal
     * XAF (Central African CFA franc, this platform's primary currency) is
     * one of these — getting this wrong would charge users 100x the real price.
     */
    private static final Set<String> ZERO_DECIMAL_CURRENCIES = Set.of(
            "bif", "clp", "djf", "gnf", "jpy", "kmf", "krw", "mga",
            "pyg", "rwf", "ugx", "vnd", "vuv", "xaf", "xof", "xpf"
    );

    private final String frontendUrl;

    public StripeClientImpl(
            @Value("${stripe.secret-key:}") String secretKey,
            @Value("${frontend.url:http://localhost}") String frontendUrl) {
        Stripe.apiKey = secretKey;
        this.frontendUrl = frontendUrl;
    }

    @Override
    public CheckoutSession createCheckoutSession(String paymentId, PaymentProvider provider,
                                                 double amount, String currency, String productName) {
        if (Stripe.apiKey == null || Stripe.apiKey.isBlank()) {
            throw new IllegalStateException(
                    "stripe.secret-key is not configured — set the STRIPE_SECRET_KEY environment variable");
        }

        String currencyLower = currency.toLowerCase(Locale.ROOT);
        long unitAmount = toStripeUnitAmount(amount, currencyLower);

        SessionCreateParams.PaymentMethodType methodType = provider == PaymentProvider.STRIPE_PAYPAL
                ? SessionCreateParams.PaymentMethodType.PAYPAL
                : SessionCreateParams.PaymentMethodType.CARD;

        SessionCreateParams params = SessionCreateParams.builder()
                .setMode(SessionCreateParams.Mode.PAYMENT)
                .addPaymentMethodType(methodType)
                .setClientReferenceId(paymentId)
                .setSuccessUrl(frontendUrl + "/checkout/return?paymentId=" + paymentId + "&status=success")
                .setCancelUrl(frontendUrl + "/checkout/return?paymentId=" + paymentId + "&status=cancelled")
                .addLineItem(
                        SessionCreateParams.LineItem.builder()
                                .setQuantity(1L)
                                .setPriceData(
                                        SessionCreateParams.LineItem.PriceData.builder()
                                                .setCurrency(currencyLower)
                                                .setUnitAmount(unitAmount)
                                                .setProductData(
                                                        SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                                                .setName(productName)
                                                                .build())
                                                .build())
                                .build())
                .build();

        try {
            Session session = Session.create(params);
            return new CheckoutSession(session.getId(), session.getUrl());
        } catch (StripeException e) {
            throw new RuntimeException("Stripe checkout session creation failed: " + e.getMessage(), e);
        }
    }

    /**
     * Package-private (not private) specifically so it's unit-testable
     * without touching the network or requiring a real API key — this
     * conversion is the one place a bug would silently over/undercharge
     * every single transaction on a zero-decimal currency.
     */
    static long toStripeUnitAmount(double amount, String currencyLower) {
        return ZERO_DECIMAL_CURRENCIES.contains(currencyLower)
                ? Math.round(amount)
                : Math.round(amount * 100);
    }
}
