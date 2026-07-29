package com.ztf.zma.community.service;

import com.ztf.zma.community.api.PushSubscribeRequest;
import com.ztf.zma.community.domain.PushSubscription;
import com.ztf.zma.community.repository.PushSubscriptionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PushSubscriptionService {

    private final PushSubscriptionRepository pushSubscriptionRepository;

    public PushSubscriptionService(PushSubscriptionRepository pushSubscriptionRepository) {
        this.pushSubscriptionRepository = pushSubscriptionRepository;
    }

    /**
     * Validates and upserts a Web Push subscription for the given user.
     * Same user + same endpoint never produces a duplicate row — the
     * existing row's keys are refreshed instead (browsers may rotate keys
     * on re-subscribe).
     */
    @Transactional
    public PushSubscription subscribe(String userEmail, PushSubscribeRequest request) {
        validate(request);

        PushSubscription subscription = pushSubscriptionRepository
                .findByUserEmailAndEndpoint(userEmail, request.endpoint())
                .orElseGet(PushSubscription::new);

        subscription.setUserEmail(userEmail);
        subscription.setEndpoint(request.endpoint());
        subscription.setP256dh(request.keys().p256dh());
        subscription.setAuth(request.keys().auth());

        return pushSubscriptionRepository.save(subscription);
    }

    public List<PushSubscription> getSubscriptions(String userEmail) {
        return pushSubscriptionRepository.findByUserEmail(userEmail);
    }

    private void validate(PushSubscribeRequest request) {
        if (request == null) {
            throw new IllegalArgumentException("Request body is required");
        }
        if (request.endpoint() == null || request.endpoint().isBlank()) {
            throw new IllegalArgumentException("endpoint is required");
        }
        if (request.keys() == null) {
            throw new IllegalArgumentException("keys is required");
        }
        if (request.keys().p256dh() == null || request.keys().p256dh().isBlank()) {
            throw new IllegalArgumentException("keys.p256dh is required");
        }
        if (request.keys().auth() == null || request.keys().auth().isBlank()) {
            throw new IllegalArgumentException("keys.auth is required");
        }
    }
}
