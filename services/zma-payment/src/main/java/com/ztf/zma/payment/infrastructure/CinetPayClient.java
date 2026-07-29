package com.ztf.zma.payment.infrastructure;

public interface CinetPayClient {

    record CheckoutResult(String checkoutUrl, String paymentToken) {}

    /**
     * Initiates a real CinetPay transaction (Orange Money and other
     * mobile-money operators supported on CinetPay's hosted checkout page).
     *
     * @param transactionId our own generated transaction id (unique per attempt —
     *                      CinetPay requires this, and it's what the webhook's
     *                      cpm_trans_id will echo back)
     * @param amount        amount in XAF (CinetPay's supported currency for this
     *                      platform's target markets — no minor-unit conversion,
     *                      XAF has no decimal subunit)
     * @param description   shown on CinetPay's hosted page
     */
    CheckoutResult initiatePayment(String transactionId, double amount, String description);
}
