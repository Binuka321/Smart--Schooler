package com.example.Skill.Horizon.Controllers;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.Skill.Horizon.Models.Post;
import com.example.Skill.Horizon.Repositories.PostReposatary;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class PostController {

    @Autowired
    private PostReposatary postRepository;

    @Value("${file.upload.directory:uploads}")
    private String uploadDirectory;

    @PostMapping
    public ResponseEntity<?> createPost(
            @RequestParam("title") String title,
            @RequestParam("content") String content,
            @RequestParam("skill") String skill,
            @RequestParam(value = "images", required = false) MultipartFile[] imageFiles) {

        try {
            // Create upload directory if it doesn't exist
            File directory = new File(uploadDirectory);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // Save images and collect their paths (if you want to implement image handling
            // later)
            List<String> imagePaths = new ArrayList<>();
            if (imageFiles != null) {
                for (MultipartFile file : imageFiles) {
                    if (!file.isEmpty()) {
                        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
                        Path filePath = Paths.get(uploadDirectory, fileName);
                        Files.write(filePath, file.getBytes());
                        imagePaths.add(fileName);
                    }
                }
            }

            // Create and save the post
            Post post = new Post();
            post.setTitle(title);
            post.setContent(content);
            post.setSkill(skill);
            // createdAt is automatically set in the constructor

            Post savedPost = postRepository.save(post);

            return ResponseEntity.ok(savedPost);
        } catch (IOException e) {
            return ResponseEntity.badRequest().body("Error uploading files: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating post: " + e.getMessage());
        }
    }

    @GetMapping
    public List<Post> getAllPosts() {
        return postRepository.findAll();
    }

    @GetMapping("/skill/{skill}")
    public List<Post> getPostsBySkill(@PathVariable String skill) {
        return postRepository.findBySkill(skill);
    }
}