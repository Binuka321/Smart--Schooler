package com.example.Skill.Horizon.Controllers;


import com.example.Skill.Horizon.Models.User;
import com.example.Skill.Horizon.Payload.MessageResponse;
import com.example.Skill.Horizon.Services.UserService;
import com.example.Skill.Horizon.Services.FileService;
import com.example.Skill.Horizon.Utils.JwtUtil;
import com.example.Skill.Horizon.Exceptions.ResourceNotFoundException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.HashMap;
import java.util.Map;
import java.util.Base64;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private FileService fileService;

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        try {
            List<User> users = userService.getAllUsers();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error retrieving users: " + e.getMessage()));
        }
    }

    @PostMapping("/create")
    public ResponseEntity<?> createUser(@RequestBody User user) {
        try {
            if (userService.existsByEmail(user.getEmail())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(new MessageResponse("Email already in use"));
            }

            User createdUser = userService.createUser(user);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdUser);
        } catch (DataIntegrityViolationException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(new MessageResponse("Invalid data: " + e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error creating user: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable String id) {
        try {
            User user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error retrieving user: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable String id) {
        try {
            userService.deleteUser(id);
            return ResponseEntity.ok(new MessageResponse("User deleted successfully"));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error deleting user: " + e.getMessage()));
        }
    }

    @GetMapping("/id")
    public ResponseEntity<?> getUserId(@RequestHeader(value = "Authorization", required = true) String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Invalid or missing token"));
            }

            String jwtToken = token.substring(7);
            String userId = jwtUtil.getUserIdFromToken(jwtToken);

            Map<String, String> response = new HashMap<>();
            response.put("userId", userId);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Error retrieving user ID: " + e.getMessage()));
        }
    }

    @GetMapping("/role")
    public ResponseEntity<?> getUserRole(@RequestHeader(value = "Authorization", required = true) String token) {
        try {
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Invalid or missing token"));
            }

            String jwtToken = token.substring(7);
            String userRole = jwtUtil.getUserRoleFromToken(jwtToken);

            Map<String, String> response = new HashMap<>();
            response.put("role", userRole);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(new MessageResponse("Error retrieving user role: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/profile-picture")
    public ResponseEntity<?> uploadProfilePicture(
            @PathVariable String id,
            @RequestParam("image") MultipartFile file,
            @RequestHeader(value = "Authorization", required = true) String token) {
        try {
            // Verify token and user ownership
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Invalid or missing token"));
            }

            String jwtToken = token.substring(7);
            String userId = jwtUtil.getUserIdFromToken(jwtToken);

            if (!userId.equals(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("You can only upload profile picture for your own account"));
            }

            // Convert image to base64
            byte[] imageBytes = file.getBytes();
            String base64Image = Base64.getEncoder().encodeToString(imageBytes);

            // Update user's profile picture in base64 format
            User user = userService.getUserById(id);
            user.setProfilePicBase64(base64Image);
            userService.updateUser(user);

            Map<String, String> response = new HashMap<>();
            response.put("profilePicBase64", base64Image);
            return ResponseEntity.ok(response);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error processing image: " + e.getMessage()));
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error processing request: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateProfile(
            @PathVariable String id,
            @RequestBody User updatedUser,
            @RequestHeader(value = "Authorization", required = true) String token) {
        try {
            // Verify token and user ownership
            if (token == null || !token.startsWith("Bearer ")) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new MessageResponse("Invalid or missing token"));
            }

            String jwtToken = token.substring(7);
            String userId = jwtUtil.getUserIdFromToken(jwtToken);

            if (!userId.equals(id)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(new MessageResponse("You can only update your own profile"));
            }

            // Get existing user
            User existingUser = userService.getUserById(id);

            // Update only the allowed fields
            existingUser.setTitle(updatedUser.getTitle());
            existingUser.setLocation(updatedUser.getLocation());
            existingUser.setAbout(updatedUser.getAbout());
            existingUser.setExperience(updatedUser.getExperience());
            existingUser.setEducation(updatedUser.getEducation());
            existingUser.setPhone(updatedUser.getPhone());
            existingUser.setWebsite(updatedUser.getWebsite());
            existingUser.setSkills(updatedUser.getSkills());

            // Save the updated user
            User savedUser = userService.updateUser(existingUser);
            return ResponseEntity.ok(savedUser);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new MessageResponse(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new MessageResponse("Error updating profile: " + e.getMessage()));
        }
    }
}