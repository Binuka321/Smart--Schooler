package com.example.Skill.Horizon.Repositories;

import com.example.Skill.Horizon.Models.Comment;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommentRepository extends MongoRepository<Comment, String> {
    List<Comment> findByPostIdOrderByTimestampDesc(String postId);
}
