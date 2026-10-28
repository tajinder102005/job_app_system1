package com.tajfolio.recommendation.controller;

import com.tajfolio.recommendation.dto.JobDTO;
import com.tajfolio.recommendation.model.UserPreference;
import com.tajfolio.recommendation.service.RecommendationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/recommendations")
public class RecommendationController {

    private final RecommendationService recommendationService;

    public RecommendationController(RecommendationService recommendationService) {
        this.recommendationService = recommendationService;
    }

    @GetMapping("/jobs/{userId}")
    public ResponseEntity<List<JobDTO>> getRecommendedJobs(
            @PathVariable Long userId,
            @RequestParam(defaultValue = "10") int limit) {
        List<JobDTO> recommendations = recommendationService.getRecommendedJobs(userId, limit);
        return ResponseEntity.ok(recommendations);
    }

    @GetMapping("/preferences/{userId}")
    public ResponseEntity<UserPreference> getUserPreferences(@PathVariable Long userId) {
        return recommendationService.getUserPreferences(userId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/preferences")
    public ResponseEntity<UserPreference> savePreferences(@RequestBody UserPreference preference) {
        UserPreference saved = recommendationService.savePreferences(preference);
        return ResponseEntity.ok(saved);
    }

    @PostMapping("/track/view")
    public ResponseEntity<Void> trackJobView(
            @RequestParam Long userId,
            @RequestParam Long jobId) {
        recommendationService.trackJobView(userId, jobId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/track/application")
    public ResponseEntity<Void> trackJobApplication(
            @RequestParam Long userId,
            @RequestParam Long jobId) {
        recommendationService.trackJobApplication(userId, jobId);
        return ResponseEntity.ok().build();
    }
}
