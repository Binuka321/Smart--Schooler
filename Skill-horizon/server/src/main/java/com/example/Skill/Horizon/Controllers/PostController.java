package com.example.Skill.Horizon.Controllers;

import com.example.Skill.Horizon.Models.Post;
import com.example.Skill.Horizon.Repositories.PostReposatary;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/posts")
@CrossOrigin(origins = "*")
public class PostController {

    @Autowired
    private PostReposatary postRepository;

    @PostMapping
    public Post createPost(@RequestBody Post post) {
        return postRepository.save(post);
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

