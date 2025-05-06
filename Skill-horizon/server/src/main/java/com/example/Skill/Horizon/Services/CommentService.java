package com.example.Skill.Horizon.Services;

import com.example.Skill.Horizon.Models.Comment;
import com.example.Skill.Horizon.Models.User;
import com.example.Skill.Horizon.Repositories.CommentRepository;
import com.example.Skill.Horizon.Repositories.UserRepository;
import com.example.Skill.Horizon.Utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtUtil jwtUtil;

    public Comment addComment(String postId, String content, String token) {
        // Extract user information from token
        String userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Comment comment = new Comment();
        comment.setPostId(postId);
        comment.setContent(content);
        comment.setUserId(userId);
        comment.setUsername(user.getUsername());
        comment.setUserProfilePic(user.getProfilePicBase64());

        return commentRepository.save(comment);
    }

    public Comment addReply(String postId, String parentCommentId, String content, String token) {
        // Extract user information from token
        String userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Get the parent comment
        Comment parentComment = commentRepository.findById(parentCommentId)
                .orElseThrow(() -> new RuntimeException("Parent comment not found"));

        // Create the reply
        Comment reply = new Comment();
        reply.setPostId(postId);
        reply.setContent(content);
        reply.setUserId(userId);
        reply.setUsername(user.getUsername());
        reply.setUserProfilePic(user.getProfilePicBase64());
        reply.setParentCommentId(parentCommentId);

        // Save the reply
        Comment savedReply = commentRepository.save(reply);

        // Add the reply to the parent comment's replies
        if (parentComment.getReplies() == null) {
            parentComment.setReplies(new java.util.ArrayList<>());
        }
        parentComment.getReplies().add(savedReply);
        commentRepository.save(parentComment);

        return savedReply;
    }

    public List<Comment> getCommentsByPostId(String postId) {
        return commentRepository.findByPostIdOrderByTimestampDesc(postId);
    }

    public boolean deleteComment(String commentId, String token) {
        String userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("You can only delete your own comments");
        }

        commentRepository.delete(comment);
        return true;
    }

    public Comment updateComment(String commentId, String content, String token) {
        String userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));

        if (!comment.getUserId().equals(userId)) {
            throw new RuntimeException("You can only edit your own comments");
        }

        comment.setContent(content);
        return commentRepository.save(comment);
    }
}
