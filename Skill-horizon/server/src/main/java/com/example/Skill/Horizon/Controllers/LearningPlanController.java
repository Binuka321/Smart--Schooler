package com.example.Skill.Horizon.Controllers;

import com.example.Skill.Horizon.Models.LearningPlan;
import com.example.Skill.Horizon.Services.LearningPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/plans")
@CrossOrigin(origins = "http://localhost:5173", allowedHeaders = "*", allowCredentials = "true")
public class LearningPlanController {

    private final LearningPlanService service;

    @Autowired
    public LearningPlanController(LearningPlanService service) {
        this.service = service;
    }

    @GetMapping
    public ResponseEntity<?> getAllPlans() {
        try {
            List<LearningPlan> plans = service.getAllPlans();
            return ResponseEntity.ok(plans);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching plans: " + e.getMessage());
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getPlanById(@PathVariable String id) {
        try {
            Optional<LearningPlan> plan = service.getPlanById(id);
            if (plan.isPresent()) {
                return ResponseEntity.ok(plan.get());
            }
            return ResponseEntity.notFound().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error fetching plan: " + e.getMessage());
        }
    }

    @PostMapping
    public ResponseEntity<?> createPlan(@RequestBody LearningPlan plan) {
        try {
            LearningPlan savedPlan = service.savePlan(plan);
            return ResponseEntity.ok(savedPlan);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error creating plan: " + e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updatePlan(@PathVariable String id, @RequestBody LearningPlan plan) {
        try {
            plan.setId(id);
            LearningPlan updatedPlan = service.savePlan(plan);
            return ResponseEntity.ok(updatedPlan);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error updating plan: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePlan(@PathVariable String id) {
        try {
            service.deletePlan(id);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error deleting plan: " + e.getMessage());
        }
    }
}
