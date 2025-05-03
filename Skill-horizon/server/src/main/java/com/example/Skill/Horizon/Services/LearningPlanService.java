package com.example.Skill.Horizon.Services;

import com.example.Skill.Horizon.Models.LearningPlan;
import com.example.Skill.Horizon.Repositories.LearningPlanRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class LearningPlanService {

    @Autowired
    private LearningPlanRepository repository;

    public List<LearningPlan> getAllPlans() {
        return repository.findAll();
    }

    public Optional<LearningPlan> getPlanById(String id) {
        return repository.findById(id);
    }

    public LearningPlan savePlan(LearningPlan plan) {
        return repository.save(plan);
    }

    public void deletePlan(String id) {
        repository.deleteById(id);
    }
}

//Fixed the issue related to delete plan

