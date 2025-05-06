package com.example.Skill.Horizon.Repositories;

import com.example.Skill.Horizon.Models.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;
import java.util.Optional;

public interface PostReposatary extends MongoRepository<Post, String> {
    List<Post> findBySkill(String skill);
    List<Post> findAllByOrderByCreatedAtDesc();
    Optional<Post> findById(String id);
    List<Post> findByUserIdOrderByCreatedAtDesc(String userId);
}
