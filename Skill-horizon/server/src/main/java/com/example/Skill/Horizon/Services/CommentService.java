package com.example.Skill.Horizon.Services;

import com.example.Skill.Horizon.Models.Comment;
import com.example.Skill.Horizon.Models.User;
import com.example.Skill.Horizon.Repositories.CommentRepository;
import com.example.Skill.Horizon.Repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CommentService {

    @Autowired
    private CommentRepository commentRepository;

    @Autowired
    private UserRepository userRepository;

    public Comment addComment(String postId, String userId, String content) {
        Optional<User> user = userRepository.findById(userId);

        if (user.isPresent()) {
            Comment comment = new Comment();
            comment.setPostId(postId);
            comment.setUser(user.get());
            comment.setContent(content);
            return commentRepository.save(comment);
        }
        return null;
    }

    public List<Comment> getCommentsByPostId(String postId) {
        return commentRepository.findByPostIdOrderByTimestampDesc(postId);
    }

    public boolean deleteComment(String commentId, String userId) {
        Optional<Comment> comment = commentRepository.findById(commentId);
        if (comment.isPresent() && comment.get().getUser().getId().equals(userId)) {
            commentRepository.delete(comment.get());
            return true;
        }
        return false;
    }
}
