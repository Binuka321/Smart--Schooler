package com.example.Skill.Horizon.Repositories;

import com.example.Skill.Horizon.Models.LearningPlan;
import org.springframework.data.mongodb.repository.MongoRepository;

// Extend MongoRepository to use built-in CRUD operations
public interface LearningPlanRepository extends MongoRepository<LearningPlan, String> {
    // You can add custom queries if necessary, such as:
    // List<LearningPlan> findByTitle(String title);
}

//This file is like the data gatekeeper. It talks directly to the MongoDB database 
// and helps us easily fetch, save, update, and delete LearningPlan documents — without writing complex code.