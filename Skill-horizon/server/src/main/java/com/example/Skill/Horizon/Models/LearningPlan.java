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
