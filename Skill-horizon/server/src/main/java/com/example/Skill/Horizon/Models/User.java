package com.example.Skill.Horizon.Models;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    @Id
    private String id;
    private String username;
    private String email;
    private String password;
    private String profilePicUrl = "";
    private String title = "";
    private String location = "";
    private String about = "";
    private String experience = "";
    private String education = "";
    private String phone = "";
    private String website = "";
    private String bio = "";
    private String profilePicBase64;
    private String role = "USER";
    private List<String> following = new ArrayList<>();
    private List<String> followers = new ArrayList<>();
    private List<String> skills = new ArrayList<>();

    private LocalDateTime registrationDate = LocalDateTime.now();
    private LocalTime lastOnline = LocalTime.now();

    @Override
    public String toString() {
        return "User{" +
                "id='" + id + '\'' +
                ", username='" + username + '\'' +
                ", email='" + email + '\'' +
                ", profilePic='" + profilePicBase64 + '\'' +
                ", following=" + following +
                '}';
    }
}
