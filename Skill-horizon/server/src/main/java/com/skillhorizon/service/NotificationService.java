package com.skillhorizon.service;

import com.skillhorizon.model.Notification;
import com.skillhorizon.repository.NotificationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public List<Notification> getUserNotifications(String userId) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public Notification createNotification(Notification notification) {
        notification.setCreatedAt(java.time.LocalDateTime.now());
        notification.setRead(false);
        Notification savedNotification = notificationRepository.save(notification);
        
        // Send real-time notification to the user
        messagingTemplate.convertAndSendToUser(
            notification.getUserId(),
            "/queue/notifications",
            savedNotification
        );
        
        return savedNotification;
    }

    public Notification markAsRead(String notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setRead(true);
        return notificationRepository.save(notification);
    }
} 