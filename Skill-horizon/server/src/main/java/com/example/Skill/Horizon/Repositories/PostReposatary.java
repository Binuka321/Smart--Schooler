package com.example.Skill.Horizon.Repositories;

import com.example.Skill.Horizon.Models.Post;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface PostReposatary extends MongoRepository<Post, String> {
    List<Post> findBySkill(String skill);
    List<Post> findAllByOrderByCreatedAtDesc();
}
