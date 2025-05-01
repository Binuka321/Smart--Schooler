package com.example.Skill.Horizon.Controllers;

import com.example.Skill.Horizon.Models.Post;
import com.example.Skill.Horizon.Models.Comment;
import com.example.Skill.Horizon.Repositories.PostReposatary;
import com.example.Skill.Horizon.Services.PostService;
import com.example.Skill.Horizon.Services.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/posts")
public class PostController {

    @Autowired
    private PostReposatary postRepository;

    @Autowired
    private PostService postService;

    @Autowired
    private CommentService commentService;

    // Create post with images
    @PostMapping(consumes = {"multipart/form-data"})
    public Post createPost(
            @RequestParam("content") String content,
            @RequestParam(value = "images", required = false) List<MultipartFile> images
    ) throws IOException {

        Post post = new Post();
        post.setContent(content);
        post.setCreatedAt(LocalDateTime.now());

        if (images != null && !images.isEmpty()) {
            List<String> base64Images = new ArrayList<>();
            for (MultipartFile image : images) {
                String base64Image = Base64.getEncoder().encodeToString(image.getBytes());
                base64Images.add(base64Image);
            }
            post.setImages(base64Images);
        }

        return postRepository.save(post);
    }

    @GetMapping // This will be /api/posts
    public List<Post> getAllPosts() {
        List<Post> posts = postRepository.findAllByOrderByCreatedAtDesc();
        // Fetch comments for each post
        for (Post post : posts) {
            List<Comment> comments = commentService.getCommentsByPostId(post.getId());
            post.setComments(comments);
        }
        return posts;
    }

    @GetMapping("/{postId}")
    public ResponseEntity<?> getPostById(@PathVariable String postId) {
        Optional<Post> post = postRepository.findById(postId);

        if (post.isPresent()) {
            // Fetch comments for the post
            List<Comment> comments = commentService.getCommentsByPostId(postId);
            post.get().setComments(comments);
            return ResponseEntity.ok(post.get());
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/first")
    public ResponseEntity<?> getFirstPost() {
        // Get the first post by limiting the result to 1
        List<Post> posts = postRepository.findAll(PageRequest.of(0, 1)).getContent();

        if (!posts.isEmpty()) {
            Post post = posts.get(0);
            // Fetch comments for the post
            List<Comment> comments = commentService.getCommentsByPostId(post.getId());
            post.setComments(comments);
            return ResponseEntity.ok(post);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/first-five")
    public ResponseEntity<?> getFirstFivePosts() {
        // Fetch first 5 posts using PageRequest
        List<Post> posts = postRepository.findAll(PageRequest.of(0, 5)).getContent(); // 0 = first page, 5 = page size

        if (!posts.isEmpty()) {
            // Fetch comments for each post
            for (Post post : posts) {
                List<Comment> comments = commentService.getCommentsByPostId(post.getId());
                post.setComments(comments);
            }
            return ResponseEntity.ok(posts); // Returns all 5 posts as a list
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Fetch posts by skill (if skill filtering is needed)
    @GetMapping("/skill/{skill}")
    public List<Post> getPostsBySkill(@PathVariable String skill) {
        List<Post> posts = postRepository.findBySkill(skill);
        // Fetch comments for each post
        for (Post post : posts) {
            List<Comment> comments = commentService.getCommentsByPostId(post.getId());
            post.setComments(comments);
        }
        return posts;
    }

    // Like a post
    @PostMapping("/{postId}/like")
    public ResponseEntity<?> likePost(
            @PathVariable String postId,
            @RequestHeader("Authorization") String token
    ) {
        try {
            Post updatedPost = postService.likePost(postId, token);
            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
