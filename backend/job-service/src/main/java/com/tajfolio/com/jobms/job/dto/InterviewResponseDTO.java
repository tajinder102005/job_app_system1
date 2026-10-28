package com.tajfolio.com.jobms.job.dto;

import com.tajfolio.com.jobms.job.interview.Interview;
import java.time.LocalDateTime;

public class InterviewResponseDTO {
    private Long id;
    private Long applicationId;
    private Long jobId;
    private String candidateEmail;
    private Long recruiterId;
    private LocalDateTime scheduledAt;
    private String interviewType;
    private String meetingLink;
    private String status;
    private String feedback;
    private Integer rating;
    private String internalNotes; // only included for recruiter/admin views

    public static InterviewResponseDTO fromEntity(Interview entity, boolean isRecruiterView) {
        if (entity == null) return null;
        InterviewResponseDTO dto = new InterviewResponseDTO();
        dto.setId(entity.getId());
        dto.setApplicationId(entity.getApplicationId());
        dto.setJobId(entity.getJobId());
        dto.setCandidateEmail(entity.getCandidateEmail());
        dto.setRecruiterId(entity.getRecruiterId());
        dto.setScheduledAt(entity.getScheduledAt());
        dto.setInterviewType(entity.getInterviewType());
        dto.setMeetingLink(entity.getMeetingLink());
        dto.setStatus(entity.getStatus());
        dto.setFeedback(entity.getFeedback());
        dto.setRating(entity.getRating());
        if (isRecruiterView) {
            dto.setInternalNotes(entity.getInternalNotes());
        }
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getApplicationId() { return applicationId; }
    public void setApplicationId(Long applicationId) { this.applicationId = applicationId; }

    public Long getJobId() { return jobId; }
    public void setJobId(Long jobId) { this.jobId = jobId; }

    public String getCandidateEmail() { return candidateEmail; }
    public void setCandidateEmail(String candidateEmail) { this.candidateEmail = candidateEmail; }

    public Long getRecruiterId() { return recruiterId; }
    public void setRecruiterId(Long recruiterId) { this.recruiterId = recruiterId; }

    public LocalDateTime getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(LocalDateTime scheduledAt) { this.scheduledAt = scheduledAt; }

    public String getInterviewType() { return interviewType; }
    public void setInterviewType(String interviewType) { this.interviewType = interviewType; }

    public String getMeetingLink() { return meetingLink; }
    public void setMeetingLink(String meetingLink) { this.meetingLink = meetingLink; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getFeedback() { return feedback; }
    public void setFeedback(String feedback) { this.feedback = feedback; }

    public Integer getRating() { return rating; }
    public void setRating(Integer rating) { this.rating = rating; }

    public String getInternalNotes() { return internalNotes; }
    public void setInternalNotes(String internalNotes) { this.internalNotes = internalNotes; }
}
