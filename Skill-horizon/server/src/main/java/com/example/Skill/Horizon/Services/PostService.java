package com.example.Skill.Horizon.Services;

import com.example.Skill.Horizon.Models.Post;
import com.example.Skill.Horizon.Repositories.PostReposatary;
import com.example.Skill.Horizon.Utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

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
} 