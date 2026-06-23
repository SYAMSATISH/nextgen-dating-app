package com.nextgen.dating.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextgen.dating.model.NotificationModel;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.Instant;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class NotificationService {

    private final String notificationsFile = "notifications.json";
    private final ObjectMapper mapper = new ObjectMapper();

    public void sendMatchNotification(
        String userId1, String userId2,
        String user1Name, String user2Name
    ) throws Exception {

        NotificationModel notif1 = new NotificationModel();
        notif1.setId(UUID.randomUUID().toString());
        notif1.setUserId(userId1);
        notif1.setType("new_match");
        notif1.setMessage("🎉 You and " + user2Name + " matched! Say hello!");
        notif1.setSenderId(userId2);
        notif1.setSenderName(user2Name);
        notif1.setRead(false);
        notif1.setCreatedAt(Instant.now().toString());

        NotificationModel notif2 = new NotificationModel();
        notif2.setId(UUID.randomUUID().toString());
        notif2.setUserId(userId2);
        notif2.setType("new_match");
        notif2.setMessage("🎉 You and " + user1Name + " matched! Say hello!");
        notif2.setSenderId(userId1);
        notif2.setSenderName(user1Name);
        notif2.setRead(false);
        notif2.setCreatedAt(Instant.now().toString());

        List<NotificationModel> all = loadNotifications();
        all.add(notif1);
        all.add(notif2);
        saveNotifications(all);
    }

    public List<NotificationModel> getNotifications(String userId) throws Exception {
        List<NotificationModel> all = loadNotifications();
        return all.stream()
            .filter(n -> userId.equals(n.getUserId()))
            .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
            .collect(Collectors.toList());
    }

    public void markAsRead(String notificationId) throws Exception {
        List<NotificationModel> all = loadNotifications();
        all.forEach(n -> {
            if (notificationId.equals(n.getId())) {
                n.setRead(true);
            }
        });
        saveNotifications(all);
    }

    public long getUnreadCount(String userId) throws Exception {
        List<NotificationModel> all = loadNotifications();
        return all.stream()
            .filter(n -> userId.equals(n.getUserId()) && !n.isRead())
            .count();
    }

    private List<NotificationModel> loadNotifications() throws Exception {
        File file = new File(notificationsFile);
        if (!file.exists()) {
            return new ArrayList<>();
        }
        return mapper.readValue(file, new TypeReference<List<NotificationModel>>() {});
    }

    private void saveNotifications(List<NotificationModel> notifications) throws Exception {
        mapper.writeValue(new File(notificationsFile), notifications);
    }
}