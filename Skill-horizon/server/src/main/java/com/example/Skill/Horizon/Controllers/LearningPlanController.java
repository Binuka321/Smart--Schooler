package com.example.Skill.Horizon.Controllers;

import com.example.Skill.Horizon.Models.LearningPlan;
import com.example.Skill.Horizon.Services.LearningPlanService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/plans")
@CrossOrigin(origins = "*")  // Allow cross-origin requests from your frontend file
public class LearningPlanController {

    private final LearningPlanService service;

    @Autowired
    public LearningPlanController(LearningPlanService service) {
        this.service = service;
    }

    @GetMapping
    public List<LearningPlan> getAllPlans() {
        return service.getAllPlans();
    }

    @GetMapping("/{id}")
    public Optional<LearningPlan> getPlanById(@PathVariable String id) {
        return service.getPlanById(id);
    }

    @PostMapping
    public LearningPlan createPlan(@RequestBody LearningPlan plan) {
        return service.savePlan(plan);
    }

    @PutMapping("/{id}")
    public LearningPlan updatePlan(@PathVariable String id, @RequestBody LearningPlan plan) {
        plan.setId(id);  // Ensure the ID is set for the update operation
        return service.savePlan(plan);
    }

    @DeleteMapping("/{id}")
    public void deletePlan(@PathVariable String id) {
        service.deletePlan(id);
    }
}

//This file defines a controller for handling the HTTP requests related to learning plans.
//It does all this by using the LearningPlanService class, which holds the actual logic for these operations. 
// This file essentially listens for incoming HTTP requests and delegates the business logic to the service.