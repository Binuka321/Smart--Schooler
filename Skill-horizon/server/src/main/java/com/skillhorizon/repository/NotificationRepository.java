package com.skillhorizon.repository;

import com.skillhorizon.model.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    @Query("{ 'userId': ?0 }")
    List<Notification> findByUserIdOrderByCreatedAtDesc(String userId);
} 