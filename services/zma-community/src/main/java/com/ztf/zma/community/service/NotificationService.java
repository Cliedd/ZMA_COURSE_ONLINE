package com.ztf.zma.community.service;

import com.ztf.zma.community.domain.Notification;
import com.ztf.zma.community.domain.PushSubscription;
import com.ztf.zma.community.repository.NotificationRepository;
import com.ztf.zma.community.repository.PushSubscriptionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository notificationRepository;
    private final PushSubscriptionRepository pushSubscriptionRepository;
    private final WebPushSenderService webPushSenderService;

    public NotificationService(NotificationRepository notificationRepository,
                                PushSubscriptionRepository pushSubscriptionRepository,
                                WebPushSenderService webPushSenderService) {
        this.notificationRepository = notificationRepository;
        this.pushSubscriptionRepository = pushSubscriptionRepository;
        this.webPushSenderService = webPushSenderService;
    }

    public List<Notification> getNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long countUnread(String userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    @Transactional
    public Notification markAsRead(String id, String userId) {
        Notification notif = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found"));
        if (!notif.getUserId().equals(userId)) {
            throw new RuntimeException("Access denied");
        }
        notif.setRead(true);
        return notificationRepository.save(notif);
    }

    @Transactional
    public Notification create(String userId, String message) {
        Notification notif = new Notification();
        notif.setUserId(userId);
        notif.setMessage(message);
        Notification saved = notificationRepository.save(notif);
        sendPushBestEffort(userId, message);
        return saved;
    }

    /**
     * Best-effort Web Push fan-out to every device the user subscribed
     * from. Must never break notification creation — any failure here is
     * caught and logged, never propagated.
     */
    private void sendPushBestEffort(String userId, String message) {
        try {
            List<PushSubscription> subscriptions = pushSubscriptionRepository.findByUserEmail(userId);
            for (PushSubscription subscription : subscriptions) {
                webPushSenderService.send(subscription, message);
            }
        } catch (Exception e) {
            log.warn("Could not fan out web push notifications for user {}: {}", userId, e.getMessage());
        }
    }

    @Transactional
    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
