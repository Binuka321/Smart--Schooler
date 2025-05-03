package com.skillhorizon.controller;

import com.example.Skill.Horizon.Models.Post;
import com.skillhorizon.model.Notification;
import com.skillhorizon.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/likes")
public class LikeController {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private NotificationService notificationService;

    @PostMapping
    public ResponseEntity<Post> likePost(@RequestParam String postId) {
        // Get the current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        // Get the post
        Post post = mongoTemplate.findById(postId, Post.class);
        if (post == null) {
            throw new RuntimeException("Post not found");
        }

        // Add like to the post
        if (post.getLikedBy() == null) {
            post.setLikedBy(new java.util.HashSet<>());
        }
        post.getLikedBy().add(username);
        post.setLikes(post.getLikes() + 1);
        mongoTemplate.save(post);

        // Create notification for the post owner
        Notification notification = new Notification();
        notification.setUserId(post.getUserId());
        notification.setType("like");
        notification.setMessage(username + " liked your post");
        notification.setPostId(postId);
        notificationService.createNotification(notification);

        return ResponseEntity.ok(post);
    }
} 