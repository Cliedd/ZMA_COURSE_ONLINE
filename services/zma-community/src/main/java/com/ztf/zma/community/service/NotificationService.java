package com.ztf.zma.community.service;

import com.ztf.zma.community.domain.Notification;
import com.ztf.zma.community.repository.NotificationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;

    public NotificationService(NotificationRepository notificationRepository) {
        this.notificationRepository = notificationRepository;
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
        return notificationRepository.save(notif);
    }

    @Transactional
    public void markAllAsRead(String userId) {
        List<Notification> unread = notificationRepository.findByUserIdAndReadFalse(userId);
        unread.forEach(n -> n.setRead(true));
        notificationRepository.saveAll(unread);
    }
}
