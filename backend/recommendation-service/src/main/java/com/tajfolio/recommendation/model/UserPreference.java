package com.tajfolio.recommendation.model;

import javax.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "user_preferences")
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private Long userId;

    @ElementCollection
    @CollectionTable(name = "user_skills", joinColumns = @JoinColumn(name = "preference_id"))
    @Column(name = "skill")
    private List<String> skills;

    @ElementCollection
    @CollectionTable(name = "user_preferred_locations", joinColumns = @JoinColumn(name = "preference_id"))
    @Column(name = "location")
    private List<String> preferredLocations;

    @ElementCollection
    @CollectionTable(name = "user_preferred_job_types", joinColumns = @JoinColumn(name = "preference_id"))
    @Column(name = "job_type")
    private List<String> preferredJobTypes;

    private String experienceLevel;
    private Double expectedMinSalary;
    private Double expectedMaxSalary;

    @ElementCollection
    @CollectionTable(name = "user_viewed_jobs", joinColumns = @JoinColumn(name = "preference_id"))
    @Column(name = "job_id")
    private List<Long> viewedJobs;

    @ElementCollection
    @CollectionTable(name = "user_applied_jobs", joinColumns = @JoinColumn(name = "preference_id"))
    @Column(name = "job_id")
    private List<Long> appliedJobs;

    private LocalDateTime updatedAt;

    @PreUpdate
    protected void onUpdate() { updatedAt = LocalDateTime.now(); }

    public UserPreference() {}

    public Long getId() { return id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public List<String> getSkills() { return skills; }
    public void setSkills(List<String> skills) { this.skills = skills; }

    public List<String> getPreferredLocations() { return preferredLocations; }
    public void setPreferredLocations(List<String> preferredLocations) { this.preferredLocations = preferredLocations; }

    public List<String> getPreferredJobTypes() { return preferredJobTypes; }
    public void setPreferredJobTypes(List<String> preferredJobTypes) { this.preferredJobTypes = preferredJobTypes; }

    public String getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(String experienceLevel) { this.experienceLevel = experienceLevel; }

    public Double getExpectedMinSalary() { return expectedMinSalary; }
    public void setExpectedMinSalary(Double expectedMinSalary) { this.expectedMinSalary = expectedMinSalary; }

    public Double getExpectedMaxSalary() { return expectedMaxSalary; }
    public void setExpectedMaxSalary(Double expectedMaxSalary) { this.expectedMaxSalary = expectedMaxSalary; }

    public List<Long> getViewedJobs() { return viewedJobs; }
    public void setViewedJobs(List<Long> viewedJobs) { this.viewedJobs = viewedJobs; }

    public List<Long> getAppliedJobs() { return appliedJobs; }
    public void setAppliedJobs(List<Long> appliedJobs) { this.appliedJobs = appliedJobs; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
