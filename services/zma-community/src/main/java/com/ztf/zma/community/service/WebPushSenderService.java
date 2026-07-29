package com.ztf.zma.community.service;

import com.ztf.zma.community.domain.PushSubscription;
import nl.martijndwars.webpush.PushService;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Security;

/**
 * Sends real Web Push notifications to browser subscriptions using VAPID.
 *
 * Best-effort only: delivery failures (expired subscription, unreachable
 * push service, malformed keys, ...) are logged and swallowed — a push
 * delivery problem must never break notification creation. Mirrors the
 * resilience contract used for inter-service calls elsewhere in this repo
 * (see zma-payment's CommunityNotificationClientImpl / zma-enrollment's
 * CommunityClient: "Could not send ..." warn-and-continue).
 */
@Service
public class WebPushSenderService {

    private static final Logger log = LoggerFactory.getLogger(WebPushSenderService.class);

    static {
        Security.addProvider(new BouncyCastleProvider());
    }

    private final PushService pushService;

    public WebPushSenderService(
            @Value("${vapid.public-key}") String vapidPublicKey,
            @Value("${vapid.private-key}") String vapidPrivateKey,
            @Value("${vapid.subject:mailto:contact@zma-academy.example}") String vapidSubject) {
        PushService svc;
        try {
            svc = new PushService(vapidPublicKey, vapidPrivateKey, vapidSubject);
        } catch (Exception e) {
            // Should not happen with a valid VAPID keypair, but never let
            // startup fail because of push wiring.
            log.warn("Could not initialize web push service: {}", e.getMessage());
            svc = null;
        }
        this.pushService = svc;
    }

    /**
     * Fire-and-forget delivery of a notification message to one stored
     * subscription. Never throws.
     */
    public void send(PushSubscription subscription, String payload) {
        if (pushService == null) {
            log.warn("Web push service not initialized; skipping push to {}", subscription.getEndpoint());
            return;
        }
        try {
            nl.martijndwars.webpush.Subscription.Keys keys =
                    new nl.martijndwars.webpush.Subscription.Keys(subscription.getP256dh(), subscription.getAuth());
            nl.martijndwars.webpush.Subscription sub =
                    new nl.martijndwars.webpush.Subscription(subscription.getEndpoint(), keys);
            nl.martijndwars.webpush.Notification notification =
                    new nl.martijndwars.webpush.Notification(sub, payload);
            pushService.send(notification);
        } catch (Exception e) {
            log.warn("Could not send web push notification to endpoint {}: {}",
                    subscription.getEndpoint(), e.getMessage());
        }
    }
}
