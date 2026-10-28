package com.tajfolio.recommendation.service;

import com.tajfolio.recommendation.client.JobServiceClient;
import com.tajfolio.recommendation.dto.JobDTO;
import com.tajfolio.recommendation.model.UserPreference;
import com.tajfolio.recommendation.repository.UserPreferenceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class RecommendationService {

    private final UserPreferenceRepository preferenceRepository;
    private final JobServiceClient jobServiceClient;

    public RecommendationService(UserPreferenceRepository preferenceRepository,
                                JobServiceClient jobServiceClient) {
        this.preferenceRepository = preferenceRepository;
        this.jobServiceClient = jobServiceClient;
    }

    public List<JobDTO> getRecommendedJobs(Long userId, int limit) {
        Optional<UserPreference> preferenceOpt = preferenceRepository.findByUserId(userId);
        
        if (preferenceOpt.isEmpty()) {
            // Return popular jobs if no preferences
            return getPopularJobs(limit);
        }
        
        UserPreference preference = preferenceOpt.get();
        List<JobDTO> allJobs = jobServiceClient.getAllJobs();
        
        // Filter out already applied jobs
        Set<Long> appliedJobIds = new HashSet<>(preference.getAppliedJobs() != null ? 
            preference.getAppliedJobs() : Collections.emptyList());
        
        List<JobDTO> candidateJobs = allJobs.stream()
            .filter(job -> !appliedJobIds.contains(job.getId()))
            .collect(Collectors.toList());
        
        // Calculate match scores
        candidateJobs.forEach(job -> {
            double score = calculateMatchScore(job, preference);
            job.setMatchScore(score);
        });
        
        // Sort by match score and return top matches
        return candidateJobs.stream()
            .sorted(Comparator.comparingDouble(JobDTO::getMatchScore).reversed())
            .limit(limit)
            .collect(Collectors.toList());
    }

    private double calculateMatchScore(JobDTO job, UserPreference preference) {
        double score = 0.0;
        double maxScore = 0.0;
        
        // Skills match (40% weight)
        if (preference.getSkills() != null && !preference.getSkills().isEmpty() &&
            job.getRequiredSkills() != null && !job.getRequiredSkills().isEmpty()) {
            
            Set<String> userSkills = preference.getSkills().stream()
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
            
            Set<String> jobSkills = job.getRequiredSkills().stream()
                .map(String::toLowerCase)
                .collect(Collectors.toSet());
            
            long matchingSkills = userSkills.stream()
                .filter(jobSkills::contains)
                .count();
            
            double skillMatch = (double) matchingSkills / jobSkills.size();
            score += skillMatch * 40;
        }
        maxScore += 40;
        
        // Location match (25% weight)
        if (preference.getPreferredLocations() != null && !preference.getPreferredLocations().isEmpty()) {
            boolean locationMatch = preference.getPreferredLocations().stream()
                .anyMatch(loc -> loc.equalsIgnoreCase(job.getLocation()));
            if (locationMatch) {
                score += 25;
            }
        }
        maxScore += 25;
        
        // Experience level match (15% weight)
        if (preference.getExperienceLevel() != null && job.getExperienceLevel() != null) {
            if (preference.getExperienceLevel().equalsIgnoreCase(job.getExperienceLevel())) {
                score += 15;
            }
        }
        maxScore += 15;
        
        // Salary match (10% weight)
        if (preference.getExpectedMinSalary() != null && job.getMinSalary() != null) {
            if (job.getMinSalary() >= preference.getExpectedMinSalary() * 0.8) {
                score += 10;
            }
        }
        maxScore += 10;
        
        // Job type match (10% weight)
        if (preference.getPreferredJobTypes() != null && !preference.getPreferredJobTypes().isEmpty()) {
            boolean jobTypeMatch = preference.getPreferredJobTypes().stream()
                .anyMatch(type -> type.equalsIgnoreCase(job.getJobType()));
            if (jobTypeMatch) {
                score += 10;
            }
        }
        maxScore += 10;
        
        // Normalize score to 0-100
        return maxScore > 0 ? (score / maxScore) * 100 : 0;
    }

    private List<JobDTO> getPopularJobs(int limit) {
        // Return recently posted jobs as fallback
        return jobServiceClient.getAllJobs().stream()
            .limit(limit)
            .collect(Collectors.toList());
    }

    @Transactional
    public UserPreference savePreferences(UserPreference preference) {
        return preferenceRepository.save(preference);
    }

    @Transactional
    public void trackJobView(Long userId, Long jobId) {
        UserPreference preference = preferenceRepository.findByUserId(userId)
            .orElse(new UserPreference());
        
        if (preference.getUserId() == null) {
            preference.setUserId(userId);
        }
        
        List<Long> viewedJobs = preference.getViewedJobs();
        if (viewedJobs == null) {
            viewedJobs = new ArrayList<>();
        }
        
        if (!viewedJobs.contains(jobId)) {
            viewedJobs.add(jobId);
            preference.setViewedJobs(viewedJobs);
            preferenceRepository.save(preference);
        }
    }

    @Transactional
    public void trackJobApplication(Long userId, Long jobId) {
        UserPreference preference = preferenceRepository.findByUserId(userId)
            .orElse(new UserPreference());
        
        if (preference.getUserId() == null) {
            preference.setUserId(userId);
        }
        
        List<Long> appliedJobs = preference.getAppliedJobs();
        if (appliedJobs == null) {
            appliedJobs = new ArrayList<>();
        }
        
        if (!appliedJobs.contains(jobId)) {
            appliedJobs.add(jobId);
            preference.setAppliedJobs(appliedJobs);
            preferenceRepository.save(preference);
        }
    }

    public Optional<UserPreference> getUserPreferences(Long userId) {
        return preferenceRepository.findByUserId(userId);
    }
}
