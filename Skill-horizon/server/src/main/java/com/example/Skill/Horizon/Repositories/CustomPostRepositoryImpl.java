package com.example.Skill.Horizon.Repositories;

import com.example.Skill.Horizon.Models.Post;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class CustomPostRepositoryImpl implements CustomPostRepository {

    @Autowired
    private MongoTemplate mongoTemplate;

    @Override
    public List<Post> findAllByOrderByCreatedAtDesc() {
        Query query = new Query();
        query.with(Sort.by(Sort.Direction.DESC, "createdAt"));
        // This is the important line that allows disk use for sorting
        query.allowDiskUse(true);

        return mongoTemplate.find(query, Post.class);
    }

    @Override
    public List<Post> findBySkill(String skill) {
        Query query = new Query();
        query.addCriteria(org.springframework.data.mongodb.core.query.Criteria.where("skill").is(skill));
        query.with(Sort.by(Sort.Direction.DESC, "createdAt"));
        query.allowDiskUse(true);

        return mongoTemplate.find(query, Post.class);
    }
}