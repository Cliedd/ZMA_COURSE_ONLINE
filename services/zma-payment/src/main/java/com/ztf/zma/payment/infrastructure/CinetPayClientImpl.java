package com.ztf.zma.payment.infrastructure;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Map;

/**
 * Real integration with CinetPay's v2 checkout API — this used to be fully
 * simulated (a fake local URL was generated and only the webhook side was
 * ever real). Docs: https://docs.cinetpay.com/api/1.0-en/checkout/initialisation
 */
@Component
public class CinetPayClientImpl implements CinetPayClient {

    private static final Logger log = LoggerFactory.getLogger(CinetPayClientImpl.class);

    private final RestClient restClient;
    private final String apiKey;
    private final String siteId;
    private final String notifyUrl;
    private final String returnUrl;

    public CinetPayClientImpl(
            @Value("${cinetpay.api-key:}") String apiKey,
            @Value("${cinetpay.site-id:}") String siteId,
            @Value("${cinetpay.notify-url:http://zma-gateway:8080/api/v1/payments/webhook/cinetpay}") String notifyUrl,
            @Value("${frontend.url:http://localhost}") String frontendUrl,
            @Value("${cinetpay.checkout-url:https://api-checkout.cinetpay.com/v2/payment}") String checkoutUrl) {
        this.apiKey = apiKey;
        this.siteId = siteId;
        this.notifyUrl = notifyUrl;
        this.returnUrl = frontendUrl + "/checkout/return";
        this.restClient = RestClient.builder().baseUrl(checkoutUrl).build();
    }

    @Override
    @SuppressWarnings("unchecked")
    public CheckoutResult initiatePayment(String transactionId, double amount, String description) {
        if (apiKey.isBlank() || siteId.isBlank()) {
            throw new IllegalStateException(
                    "cinetpay.api-key / cinetpay.site-id are not configured — set the "
                    + "CINETPAY_API_KEY and CINETPAY_SITE_ID environment variables");
        }

        Map<String, Object> body = Map.of(
                "apikey", apiKey,
                "site_id", siteId,
                "transaction_id", transactionId,
                // CinetPay requires an integer amount for XAF (zero-decimal currency).
                "amount", Math.round(amount),
                "currency", "XAF",
                "description", description,
                "notify_url", notifyUrl,
                "return_url", returnUrl,
                "channels", "ALL"
        );

        Map<String, Object> response;
        try {
            response = restClient.post()
                    .body(body)
                    .retrieve()
                    .body(Map.class);
        } catch (Exception ex) {
            log.error("CinetPay initiate-payment call failed for transaction {}: {}", transactionId, ex.getMessage());
            throw new RuntimeException("CinetPay checkout initiation failed: " + ex.getMessage(), ex);
        }

        if (response == null || !"201".equals(String.valueOf(response.get("code")))) {
            String message = response != null ? String.valueOf(response.get("message")) : "no response";
            log.error("CinetPay rejected initiate-payment for transaction {}: {}", transactionId, message);
            throw new RuntimeException("CinetPay checkout initiation rejected: " + message);
        }

        Map<String, Object> data = (Map<String, Object>) response.get("data");
        String checkoutUrl = data != null ? (String) data.get("payment_url") : null;
        String paymentToken = data != null ? (String) data.get("payment_token") : null;
        if (checkoutUrl == null) {
            throw new RuntimeException("CinetPay response missing payment_url for transaction " + transactionId);
        }

        return new CheckoutResult(checkoutUrl, paymentToken);
    }
}
