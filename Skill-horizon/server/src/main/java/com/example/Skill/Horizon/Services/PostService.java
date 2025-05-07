package com.example.Skill.Horizon.Services;

import com.example.Skill.Horizon.Models.Post;
import com.example.Skill.Horizon.Repositories.PostReposatary;
import com.example.Skill.Horizon.Utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class PostService {

    @Autowired
    private PostReposatary postRepository;

    @Autowired
    private JwtUtil jwtUtil;

    public Optional<Post> getPostById(String id) {
        return postRepository.findById(id);
    }

    public Post likePost(String postId, String token) {
        String userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
        
        Optional<Post> postOpt = postRepository.findById(postId);
        if (postOpt.isEmpty()) {
            throw new RuntimeException("Post not found");
        }

        Post post = postOpt.get();
        if (post.getLikedBy() == null) {
            post.setLikedBy(new java.util.HashSet<>());
        }

        if (post.getLikedBy().contains(userId)) {
            // Unlike the post
            post.getLikedBy().remove(userId);
            post.setLikes(post.getLikes() - 1);
        } else {
            // Like the post
            post.getLikedBy().add(userId);
            post.setLikes(post.getLikes() + 1);
        }

        return postRepository.save(post);
    }

    // Add method to check if post is liked by user
    public boolean isPostLikedByUser(String postId, String userId) {
        Optional<Post> postOpt = postRepository.findById(postId);
        if (postOpt.isEmpty()) {
            return false;
        }
        Post post = postOpt.get();
        return post.getLikedBy() != null && post.getLikedBy().contains(userId);
    }

    // Add method to get posts with liked status
    public List<Post> getPostsWithLikedStatus(List<Post> posts, String userId) {
        for (Post post : posts) {
            post.setLiked(isPostLikedByUser(post.getId(), userId));
        }
        return posts;
    }
} 