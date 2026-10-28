package com.tajfolio.com.jobms.job.audit;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "audit_events")
public class AuditEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long actorId;
    private String actorRole;

    // e.g. JOB_CREATED, APPLICATION_SUBMITTED, CANDIDATE_SHORTLISTED, INTERVIEW_SCHEDULED
    private String action;

    // e.g. JOB, APPLICATION, INTERVIEW, USER, COMPANY
    private String resourceType;

    private Long resourceId;

    private LocalDateTime timestamp = LocalDateTime.now();

    // JSON metadata string for additional context
    @Column(columnDefinition = "TEXT")
    private String metadata;

    public AuditEvent() {}

    public AuditEvent(Long actorId, String actorRole, String action,
                      String resourceType, Long resourceId, String metadata) {
        this.actorId = actorId;
        this.actorRole = actorRole;
        this.action = action;
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.metadata = metadata;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getActorId() { return actorId; }
    public void setActorId(Long actorId) { this.actorId = actorId; }

    public String getActorRole() { return actorRole; }
    public void setActorRole(String actorRole) { this.actorRole = actorRole; }

    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }

    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }

    public Long getResourceId() { return resourceId; }
    public void setResourceId(Long resourceId) { this.resourceId = resourceId; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getMetadata() { return metadata; }
    public void setMetadata(String metadata) { this.metadata = metadata; }
}
