package com.example.Skill.Horizon.Models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "posts")
public class Post {

    @Id
    private String id;

    private String title;
    private String content;
    private String skill;
    private List<String> images; // Add this line to store Base64-encoded images
    private LocalDateTime createdAt;

    public Post() {
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getSkill() { return skill; }
    public void setSkill(String skill) { this.skill = skill; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public List<String> getImages() { return images; }
    public void setImages(List<String> images) { this.images = images;}
}
