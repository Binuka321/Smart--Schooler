package com.example.Skill.Horizon.Controllers;

import com.example.Skill.Horizon.Models.Post;
import com.example.Skill.Horizon.Models.Comment;
import com.example.Skill.Horizon.Repositories.PostReposatary;
import com.example.Skill.Horizon.Services.PostService;
import com.example.Skill.Horizon.Services.CommentService;
import com.example.Skill.Horizon.Utils.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpStatus;

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

    @Autowired
    private JwtUtil jwtUtil;

    // Delete a post
    @DeleteMapping("/{postId}")
    public ResponseEntity<?> deletePost(
            @PathVariable String postId,
            @RequestHeader("Authorization") String token
    ) {
        try {
            String userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
            Optional<Post> postOpt = postRepository.findById(postId);
            
            if (postOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Post post = postOpt.get();
            if (!post.getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only delete your own posts");
            }

            postRepository.delete(post);
            return ResponseEntity.ok().body("Post deleted successfully");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting post: " + e.getMessage());
        }
    }

    // Create post with images
    @PostMapping(consumes = {"multipart/form-data"})
    public Post createPost(
            @RequestParam("content") String content,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @RequestHeader("Authorization") String token
    ) throws IOException {
        String userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
        
        Post post = new Post();
        post.setContent(content);
        post.setUserId(userId);
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
    public ResponseEntity<?> getFirstFivePosts(@RequestHeader(value = "Authorization", required = false) String token) {
        try {
            // Fetch first 5 posts using PageRequest, sorted by createdAt in descending order
            List<Post> posts = postRepository.findAll(PageRequest.of(0, 5, Sort.by("createdAt").descending())).getContent();

            if (!posts.isEmpty()) {
                // Get current user ID if token is provided
                String userId = null;
                if (token != null && token.startsWith("Bearer ")) {
                    userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
                }

                // Add liked status for each post
                if (userId != null) {
                    posts = postService.getPostsWithLikedStatus(posts, userId);
                }

                // Fetch comments for each post
                for (Post post : posts) {
                    List<Comment> comments = commentService.getCommentsByPostId(post.getId());
                    post.setComments(comments);
                }
                return ResponseEntity.ok(posts);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching posts: " + e.getMessage());
        }
    }

    // Add new endpoint to get posts by user ID
    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getPostsByUserId(@PathVariable String userId) {
        try {
            List<Post> posts = postRepository.findByUserIdOrderByCreatedAtDesc(userId);
            
            // Fetch comments for each post
            for (Post post : posts) {
                List<Comment> comments = commentService.getCommentsByPostId(post.getId());
                post.setComments(comments);
            }
            
            return ResponseEntity.ok(posts);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching user posts: " + e.getMessage());
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

    // Edit a post
    @PutMapping(value = "/{postId}", consumes = {"multipart/form-data"})
    public ResponseEntity<?> editPost(
            @PathVariable String postId,
            @RequestParam("content") String content,
            @RequestParam(value = "images", required = false) List<MultipartFile> images,
            @RequestHeader("Authorization") String token
    ) {
        try {
            String userId = jwtUtil.getUserIdFromToken(token.replace("Bearer ", ""));
            Optional<Post> postOpt = postRepository.findById(postId);
            
            if (postOpt.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            Post post = postOpt.get();
            if (!post.getUserId().equals(userId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You can only edit your own posts");
            }

            // Update post content
            post.setContent(content);

            // Update images if provided
            if (images != null && !images.isEmpty()) {
                List<String> base64Images = new ArrayList<>();
                for (MultipartFile image : images) {
                    String base64Image = Base64.getEncoder().encodeToString(image.getBytes());
                    base64Images.add(base64Image);
                }
                post.setImages(base64Images);
            }

            Post updatedPost = postRepository.save(post);
            
            // Fetch comments for the updated post
            List<Comment> comments = commentService.getCommentsByPostId(postId);
            updatedPost.setComments(comments);

            return ResponseEntity.ok(updatedPost);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating post: " + e.getMessage());
        }
    }
}
