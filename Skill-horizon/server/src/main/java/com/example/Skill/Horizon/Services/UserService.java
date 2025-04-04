package com.example.Skill.Horizon.Services;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.Skill.Horizon.Models.User;
import com.example.Skill.Horizon.Repositories.UserRepository;
import com.example.Skill.Horizon.Exceptions.ResourceNotFoundException;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Autowired
    private PasswordEncoder passwordEncoder;

    public User createUser(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
    }

    public void deleteUser(String id) {
        userRepository.deleteById(id);
    }

    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User updateUser(User user) {
        if (!userRepository.existsById(user.getId())) {
            throw new ResourceNotFoundException("User not found with id: " + user.getId());
        }
        return userRepository.save(user);
    }
}