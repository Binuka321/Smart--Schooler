package com.example.Skill.Horizon.Controllers;

import com.example.Skill.Horizon.Models.Comment;
import com.example.Skill.Horizon.Services.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*")
public class CommentController {

    @Autowired
    private CommentService commentService;

    // Create a new comment
    @PostMapping
    public Comment addComment(
            @RequestParam("postId") String postId,
            @RequestParam("userId") String userId,
            @RequestParam("content") String content
    ) {
        return commentService.addComment(postId, userId, content);
    }

    // Get all comments for a post
    @GetMapping("/{postId}")
    public List<Comment> getCommentsByPostId(@PathVariable String postId) {
        return commentService.getCommentsByPostId(postId);
    }

    // Delete a comment
    @DeleteMapping("/{commentId}")
    public String deleteComment(
            @PathVariable String commentId,
            @RequestParam("userId") String userId
    ) {
        boolean deleted = commentService.deleteComment(commentId, userId);
        return deleted ? "Comment deleted successfully" : "Failed to delete comment";
    }
}
