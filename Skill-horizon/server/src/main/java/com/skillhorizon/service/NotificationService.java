package com.skillhorizon.service;

import com.skillhorizon.model.Notification;
import com.skillhorizon.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    public List<Notification> getUserNotifications(String username) {
        // For now, we'll use a direct query to get notifications by user email
        return notificationRepository.findByUserEmailOrderByCreatedAtDesc(username);
    }

    public void markAsRead(Long notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public Notification createNotification(Notification notification) {
        return notificationRepository.save(notification);
    }
} 