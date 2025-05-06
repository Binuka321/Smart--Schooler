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
        try {
            System.out.println("CommentService: Starting delete operation for comment: " + commentId);
            
            String userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
            System.out.println("CommentService: User ID from token: " + userId);

            // Find the comment
            Comment comment = commentRepository.findById(commentId).orElse(null);
            if (comment == null) {
                System.out.println("CommentService: Comment not found directly, searching in parent comments");
                // Find all parent comments
                List<Comment> parentComments = commentRepository.findAll();
                for (Comment parent : parentComments) {
                    if (parent.getReplies() != null) {
                        for (Comment reply : parent.getReplies()) {
                            if (reply.getId().equals(commentId)) {
                                System.out.println("CommentService: Found comment in parent's replies");
                                // Remove from parent's replies
                                parent.getReplies().removeIf(r -> r.getId().equals(commentId));
                                commentRepository.save(parent);
                                System.out.println("CommentService: Comment deleted successfully");
                                return true;
                            }
                        }
                    }
                }
                System.out.println("CommentService: Comment not found anywhere");
                throw new RuntimeException("Comment not found with ID: " + commentId);
            }

            System.out.println("CommentService: Found comment: " + comment.getId());

            if (!comment.getUserId().equals(userId)) {
                System.out.println("CommentService: User ID mismatch. Comment user: " + comment.getUserId() + ", Current user: " + userId);
                throw new RuntimeException("You can only delete your own comments");
            }

            // If this is a parent comment, delete all its replies first
            if (comment.getReplies() != null && !comment.getReplies().isEmpty()) {
                System.out.println("CommentService: This is a parent comment. Deleting all replies");
                for (Comment reply : comment.getReplies()) {
                    commentRepository.delete(reply);
                }
            }

            // Delete the comment
            System.out.println("CommentService: Deleting the comment document");
            commentRepository.delete(comment);
            
            System.out.println("CommentService: Comment deleted successfully");
            return true;
        } catch (Exception e) {
            System.out.println("CommentService: Error deleting comment: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error deleting comment: " + e.getMessage());
        }
    }

    public Comment updateComment(String commentId, String content, String token) {
        try {
            System.out.println("CommentService: Starting update operation for comment: " + commentId);
            
            String userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
            System.out.println("CommentService: User ID from token: " + userId);

            // First try to find the comment directly
            Comment comment = commentRepository.findById(commentId).orElse(null);
            
            // If comment not found directly, it might be in a parent's replies
            if (comment == null) {
                System.out.println("CommentService: Comment not found directly, searching in parent comments");
                // Find all parent comments
                List<Comment> parentComments = commentRepository.findAll();
                for (Comment parent : parentComments) {
                    if (parent.getReplies() != null) {
                        for (Comment reply : parent.getReplies()) {
                            if (reply.getId().equals(commentId)) {
                                System.out.println("CommentService: Found comment in parent's replies");
                                // Update the reply content
                                reply.setContent(content);
                                // Save the parent comment to persist the changes
                                commentRepository.save(parent);
                                return reply;
                            }
                        }
                    }
                }
                System.out.println("CommentService: Comment not found anywhere");
                throw new RuntimeException("Comment not found with ID: " + commentId);
            }

            System.out.println("CommentService: Found comment: " + comment.getId());

            if (!comment.getUserId().equals(userId)) {
                System.out.println("CommentService: User ID mismatch. Comment user: " + comment.getUserId() + ", Current user: " + userId);
                throw new RuntimeException("You can only edit your own comments");
            }

            // Update the comment content
            comment.setContent(content);
            return commentRepository.save(comment);
        } catch (Exception e) {
            System.out.println("CommentService: Error updating comment: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Error updating comment: " + e.getMessage());
        }
    }
}
