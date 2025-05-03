package com.skillhorizon.repository;

import com.skillhorizon.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdOrderByCreatedAtDesc(Long userId);

    @Query("SELECT n FROM Notification n JOIN n.user u WHERE u.email = :email ORDER BY n.createdAt DESC")
    List<Notification> findByUserEmailOrderByCreatedAtDesc(@Param("email") String email);
} 