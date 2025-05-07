package com.example.Skill.Horizon.Repositories;

import com.example.Skill.Horizon.Models.LearningPlan;
import org.springframework.data.mongodb.repository.MongoRepository;

// Extend MongoRepository to use built-in CRUD operations
public interface LearningPlanRepository extends MongoRepository<LearningPlan, String> {
    // You can add custom queries if necessary, such as:
    // List<LearningPlan> findByTitle(String title);
}

//Database connection fixed
//Final fix attempt - 1