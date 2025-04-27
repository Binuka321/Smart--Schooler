package com.example.Skill.Horizon.Controllers;

import com.example.Skill.Horizon.Models.Comment;
import com.example.Skill.Horizon.Services.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*")
public class CommentController {

    @Autowired
    private CommentService commentService;

    // Create a new comment
    @PostMapping("/post/{postId}")
    public ResponseEntity<?> addComment(
            @PathVariable String postId,
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> payload
    ) {
        try {
            String content = payload.get("text");
            Comment comment = commentService.addComment(postId, content, token);
            return ResponseEntity.ok(comment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Get all comments for a post
    @GetMapping("/post/{postId}")
    public ResponseEntity<List<Comment>> getCommentsByPostId(@PathVariable String postId) {
        List<Comment> comments = commentService.getCommentsByPostId(postId);
        return ResponseEntity.ok(comments);
    }

    // Delete a comment
    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable String commentId,
            @RequestHeader("Authorization") String token
    ) {
        try {
            boolean deleted = commentService.deleteComment(commentId, token);
            if (deleted) {
                return ResponseEntity.ok().body("Comment deleted successfully");
            }
            return ResponseEntity.badRequest().body("Failed to delete comment");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    // Edit a comment
    @PutMapping("/{commentId}")
    public ResponseEntity<?> editComment(
            @PathVariable String commentId,
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> payload
    ) {
        try {
            String content = payload.get("text");
            Comment updatedComment = commentService.editComment(commentId, content, token);
            return ResponseEntity.ok(updatedComment);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
