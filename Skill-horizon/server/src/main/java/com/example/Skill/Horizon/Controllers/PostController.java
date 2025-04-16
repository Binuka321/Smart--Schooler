package com.example.Skill.Horizon.Controllers;

import com.example.Skill.Horizon.Models.Post;
import com.example.Skill.Horizon.Repositories.PostReposatary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Base64;
import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*")

//@CrossOrigin(origins = "*")
public class PostController {

    @Autowired
    private PostReposatary postRepository;

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

    // Fetch all posts
    @GetMapping
    public List<Post> getAllPosts() {
        return postRepository.findAllByOrderByCreatedAtDesc();
    }

    // Fetch posts by skill (if skill filtering is needed)
    @GetMapping("/skill/{skill}")
    public List<Post> getPostsBySkill(@PathVariable String skill) {
        return postRepository.findBySkill(skill);
    }
}
