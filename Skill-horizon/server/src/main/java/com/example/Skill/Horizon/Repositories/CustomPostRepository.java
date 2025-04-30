package com.example.Skill.Horizon.Repositories;

import com.example.Skill.Horizon.Models.Post;
import java.util.List;

public interface CustomPostRepository {
    List<Post> findAllByOrderByCreatedAtDesc();
    List<Post> findBySkill(String skill);
}