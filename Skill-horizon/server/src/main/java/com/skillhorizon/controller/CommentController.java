package com.skillhorizon.controller;

import com.example.Skill.Horizon.Models.Comment;
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
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Autowired
    private NotificationService notificationService;

    @PostMapping
    public ResponseEntity<Post> addComment(@RequestParam String postId, @RequestBody Comment comment) {
        // Get the current authenticated user
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();

        // Get the post
        Post post = mongoTemplate.findById(postId, Post.class);
        if (post == null) {
            throw new RuntimeException("Post not found");
        }

        // Set comment properties
        comment.setPostId(postId);
        comment.setUserId(username);
        comment.setUsername(username);
        comment.setTimestamp(java.time.LocalDateTime.now());

        // Add comment to the post
        if (post.getComments() == null) {
            post.setComments(new java.util.ArrayList<>());
        }
        post.getComments().add(comment);
        mongoTemplate.save(post);

        // Create notification for the post owner
        Notification notification = new Notification();
        notification.setUserId(post.getUserId());
        notification.setType("comment");
        notification.setMessage(username + " commented on your post: " + comment.getContent());
        notification.setPostId(postId);
        notificationService.createNotification(notification);

        return ResponseEntity.ok(post);
    }
} 