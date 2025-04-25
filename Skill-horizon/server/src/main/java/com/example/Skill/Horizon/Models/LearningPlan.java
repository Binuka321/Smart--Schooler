package com.example.Skill.Horizon.Models;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.List;

@Data
@Document(collection = "new_learning_plans")  // Changed collection name
public class LearningPlan {

    @Id
    private String id;
    private String title;
    private String subtitle;
    private List<String> items;
}

//This file defines what a LearningPlan is — kind of like a form template. 
// Each plan has an id, a title, a subtitle, and a list of items (steps or goals). 
// It’s stored in a MongoDB collection called "new_learning_plans". 
// @DATA ---> Lombok takes care of the repetitive getter/setter code so you can focus on the real logic.

