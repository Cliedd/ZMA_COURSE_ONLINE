package com.ztf.zma.payment.infrastructure;

public interface CommunityNotificationClient {
    void notifyPaymentConfirmed(String studentId, String courseTitle);
}
