package com.example.Skill.Horizon.Controllers;

import com.example.Skill.Horizon.Models.Comment;
import com.example.Skill.Horizon.Services.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

    // Add a reply to a comment
    @PostMapping("/post/{postId}/reply/{commentId}")
    public ResponseEntity<?> addReply(
            @PathVariable String postId,
            @PathVariable String commentId,
            @RequestHeader("Authorization") String token,
            @RequestBody Map<String, String> payload
    ) {
        try {
            String content = payload.get("text");
            Comment reply = commentService.addReply(postId, commentId, content, token);
            return ResponseEntity.ok(reply);
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
            System.out.println("Attempting to delete comment: " + commentId);
            System.out.println("Token: " + token);

            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().body("Invalid or missing token");
            }

            boolean deleted = commentService.deleteComment(commentId, token);
            if (deleted) {
                return ResponseEntity.ok().body("Comment deleted successfully");
            }
            return ResponseEntity.badRequest().body("Failed to delete comment");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("An error occurred while deleting the comment");
        }
    }

    @PutMapping("/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable String commentId,
            @RequestBody Map<String, String> request,
            @RequestHeader("Authorization") String token) {
        try {
            System.out.println("CommentController: Updating comment: " + commentId);
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.badRequest().body("Invalid or missing token");
            }

            String content = request.get("text");
            if (content == null || content.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Comment content cannot be empty");
            }

            System.out.println("CommentController: Updating comment with content: " + content);
            Comment updatedComment = commentService.updateComment(commentId, content, token);
            return ResponseEntity.ok(updatedComment);
        } catch (RuntimeException e) {
            System.out.println("CommentController: Error updating comment: " + e.getMessage());
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            System.out.println("CommentController: Unexpected error updating comment: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("An error occurred while updating the comment");
        }
    }
}
