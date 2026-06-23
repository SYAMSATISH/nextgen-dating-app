package com.nextgen.dating.controller;

import com.nextgen.dating.model.NotificationModel;
import com.nextgen.dating.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/notifications/{userId}")
    public ResponseEntity<?> getNotifications(@PathVariable String userId) {
        try {
            List<NotificationModel> notifications =
                notificationService.getNotifications(userId);
            return ResponseEntity.ok(notifications);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Failed to get notifications", "details", e.getMessage()));
        }
    }

    @PostMapping("/send-notification")
    public ResponseEntity<?> sendNotification(@RequestBody Map<String, String> request) {
        String userId1 = request.get("userId1");
        String userId2 = request.get("userId2");
        String user1Name = request.get("user1Name");
        String user2Name = request.get("user2Name");

        if (userId1 == null || userId2 == null) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "userId1 and userId2 are required"));
        }
        try {
            notificationService.sendMatchNotification(userId1, userId2, user1Name, user2Name);
            return ResponseEntity.ok(Map.of("success", true, "message", "Notifications sent"));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Failed to send", "details", e.getMessage()));
        }
    }

    @PutMapping("/notifications/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String notificationId) {
        try {
            notificationService.markAsRead(notificationId);
            return ResponseEntity.ok(Map.of("success", true));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Failed to mark as read", "details", e.getMessage()));
        }
    }

    @GetMapping("/notifications/{userId}/unread-count")
    public ResponseEntity<?> getUnreadCount(@PathVariable String userId) {
        try {
            long count = notificationService.getUnreadCount(userId);
            return ResponseEntity.ok(Map.of("unreadCount", count));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Failed to get count", "details", e.getMessage()));
        }
    }
}