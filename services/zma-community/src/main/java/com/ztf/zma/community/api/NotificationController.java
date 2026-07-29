package com.ztf.zma.community.api;

import com.ztf.zma.community.domain.Notification;
import com.ztf.zma.community.domain.PushSubscription;
import com.ztf.zma.community.service.NotificationService;
import com.ztf.zma.community.service.PushSubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final PushSubscriptionService pushSubscriptionService;

    public NotificationController(NotificationService notificationService,
                                   PushSubscriptionService pushSubscriptionService) {
        this.notificationService = notificationService;
        this.pushSubscriptionService = pushSubscriptionService;
    }

    @Operation(summary = "List current user's notifications")
    @GetMapping
    public List<Notification> getNotifications(Authentication auth) {
        return notificationService.getNotifications(auth.getName());
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(Authentication auth) {
        return Map.of("count", notificationService.countUnread(auth.getName()));
    }

    @PatchMapping("/{id}/read")
    public Notification markAsRead(@PathVariable String id, Authentication auth) {
        return notificationService.markAsRead(id, auth.getName());
    }

    @PatchMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllAsRead(Authentication auth) {
        notificationService.markAllAsRead(auth.getName());
    }

    /** Internal endpoint — called by zma-enrollment after successful enrollment */
    @PostMapping("/internal/notify")
    @ResponseStatus(HttpStatus.CREATED)
    public Notification internalNotify(@RequestBody Map<String, String> body) {
        return notificationService.create(body.get("userId"), body.get("message"));
    }

    @Operation(summary = "Subscribe (or refresh) the current device for Web Push notifications")
    @PostMapping("/push/subscribe")
    @ResponseStatus(HttpStatus.CREATED)
    public PushSubscription subscribeToPush(@RequestBody PushSubscribeRequest request, Authentication auth) {
        return pushSubscriptionService.subscribe(auth.getName(), request);
    }
}
