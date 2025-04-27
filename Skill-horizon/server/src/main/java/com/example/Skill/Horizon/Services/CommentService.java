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
}
