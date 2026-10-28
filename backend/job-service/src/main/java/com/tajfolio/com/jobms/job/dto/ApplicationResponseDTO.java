package com.tajfolio.com.jobms.job.dto;

import com.tajfolio.com.jobms.job.application.Application;
import java.time.LocalDateTime;

public class ApplicationResponseDTO {
    private Long id;
    private Long jobId;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String resumeUrl;
    private Integer resumeVersion;
    private String coverLetter;
    private String status;
    private LocalDateTime appliedDate;
    private LocalDateTime interviewDate;
    private String interviewTime;
    private String interviewLocation;
    private String notes;

    public static ApplicationResponseDTO fromEntity(Application entity) {
        if (entity == null) return null;
        ApplicationResponseDTO dto = new ApplicationResponseDTO();
        dto.setId(entity.getId());
        dto.setJobId(entity.getJobId());
        dto.setFirstName(entity.getFirstName());
        dto.setLastName(entity.getLastName());
        dto.setEmail(entity.getEmail());
        dto.setPhone(entity.getPhone());
        dto.setResumeUrl(entity.getResumeUrl());
        dto.setResumeVersion(entity.getResumeVersion());
        dto.setCoverLetter(entity.getCoverLetter());
        dto.setStatus(entity.getStatus());
        dto.setAppliedDate(entity.getAppliedDate());
        dto.setInterviewDate(entity.getInterviewDate());
        dto.setInterviewTime(entity.getInterviewTime());
        dto.setInterviewLocation(entity.getInterviewLocation());
        dto.setNotes(entity.getNotes());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getFirstName() { return firstName; }
    public void setFirstName(String firstName) { this.firstName = firstName; }

    public String getLastName() { return lastName; }
    public void setLastName(String lastName) { this.lastName = lastName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }

    public String getResumeUrl() { return resumeUrl; }
    public void setResumeUrl(String resumeUrl) { this.resumeUrl = resumeUrl; }

    public Integer getResumeVersion() { return resumeVersion; }
    public void setResumeVersion(Integer resumeVersion) { this.resumeVersion = resumeVersion; }

    public String getCoverLetter() { return coverLetter; }
    public void setCoverLetter(String coverLetter) { this.coverLetter = coverLetter; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getAppliedDate() { return appliedDate; }
    public void setAppliedDate(LocalDateTime appliedDate) { this.appliedDate = appliedDate; }

    public LocalDateTime getInterviewDate() { return interviewDate; }
    public void setInterviewDate(LocalDateTime interviewDate) { this.interviewDate = interviewDate; }

    public String getInterviewTime() { return interviewTime; }
    public void setInterviewTime(String interviewTime) { this.interviewTime = interviewTime; }

    public String getInterviewLocation() { return interviewLocation; }
    public void setInterviewLocation(String interviewLocation) { this.interviewLocation = interviewLocation; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
