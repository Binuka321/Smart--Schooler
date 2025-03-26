package com.example.demo;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class HomeController{

    @GetMapping("/home")
    public Map<String, Object> home() {
        return Map.of(
            "title", "LearnHub - Your Gateway to Knowledge",
            "welcomeMessage", "Empower your learning journey with expert-led courses and interactive content.",
            "features", new String[]{"Expert Instructors", "Interactive Lessons", "Certification Programs", "Community Support"}
        );
    }
}