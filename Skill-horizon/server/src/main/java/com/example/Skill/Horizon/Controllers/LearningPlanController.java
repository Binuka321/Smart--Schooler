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

//Controller file to handle all requests
//Fix some issues related to controller file
//Found some issues