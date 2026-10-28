package com.tajfolio.com.jobms.job.controller;

import com.tajfolio.com.jobms.job.Job;
import com.tajfolio.com.jobms.job.JobRepository;
import com.tajfolio.com.jobms.job.application.Application;
import com.tajfolio.com.jobms.job.application.ApplicationRepository;
import com.tajfolio.com.jobms.job.application.ApplicationStatus;
import com.tajfolio.com.jobms.job.audit.AuditEvent;
import com.tajfolio.com.jobms.job.audit.AuditEventRepository;
import com.tajfolio.com.jobms.job.external.Company;
import com.tajfolio.com.jobms.job.outbox.OutboxEvent;
import com.tajfolio.com.jobms.job.outbox.OutboxEventRepository;
import com.tajfolio.com.jobms.job.client.CompanyClient;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/applications")
@CrossOrigin(origins = "*")
public class ApplicationController {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final RabbitTemplate rabbitTemplate;
    private final AuditEventRepository auditEventRepository;
    private final OutboxEventRepository outboxEventRepository;
    private final CompanyClient companyClient;

    @Value("${rabbitmq.exchange.notification:notification.exchange}")
    private String notificationExchange;

    public ApplicationController(ApplicationRepository applicationRepository,
                                 JobRepository jobRepository,
                                 RabbitTemplate rabbitTemplate,
                                 AuditEventRepository auditEventRepository,
                                 OutboxEventRepository outboxEventRepository,
                                 @Autowired(required = false) CompanyClient companyClient) {
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.rabbitTemplate = rabbitTemplate;
        this.auditEventRepository = auditEventRepository;
        this.outboxEventRepository = outboxEventRepository;
        this.companyClient = companyClient;
    }

    @PostMapping
    public ResponseEntity<Map<String, String>> submit(
            @RequestBody Map<String, Object> req,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {

        Application app = new Application();
        app.setJobId(req.get("jobId") != null ? Long.valueOf(req.get("jobId").toString()) : null);
        app.setFirstName((String) req.get("firstName"));
        app.setLastName((String) req.get("lastName"));
        app.setEmail((String) req.get("email"));
        app.setPhone((String) req.get("phone"));
        app.setResumeUrl((String) req.get("resumeUrl"));
        app.setCoverLetter((String) req.get("coverLetter"));
        app.setStatus(ApplicationStatus.APPLIED.name());

        // Snapshot resume version at apply time
        if (req.get("resumeVersion") != null) {
            app.setResumeVersion(Integer.valueOf(req.get("resumeVersion").toString()));
        }

        // Duplicate apply prevention
        String applicantEmail = app.getEmail();
        Long jobIdCheck = app.getJobId();
        if (applicantEmail != null && jobIdCheck != null) {
            if (applicationRepository.existsByEmailAndJobId(applicantEmail, jobIdCheck)) {
                return ResponseEntity.status(409)
                    .body(Map.of("message", "You have already applied for this job"));
            }
        }

        Application saved = applicationRepository.save(app);

        // Audit: APPLICATION_SUBMITTED
        recordAudit(userId, "CANDIDATE", "APPLICATION_SUBMITTED", "APPLICATION", saved.getId(),
                "jobId=" + saved.getJobId() + ", candidate=" + saved.getEmail());

        // Transactional Outbox: persist event to DB inside the transaction
        Map<String, Object> event = buildApplicationEvent(saved);
        event.put("eventId", "app-sub-" + saved.getId());
        recordOutbox("APPLICATION", saved.getId(), "application.submitted", event);

        // Immediate fire-and-forget for local dev
        try {
            rabbitTemplate.convertAndSend(notificationExchange, "application.submitted", event);
            rabbitTemplate.convertAndSend("application.exchange", "application.created", event);
        } catch (Exception ignored) {}

        return ResponseEntity.ok(Map.of("message", "Application submitted successfully"));
    }

    @GetMapping("/my")
    public ResponseEntity<List<Map<String, Object>>> getMyApplications(
            @RequestParam(required = false) String email,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail) {
        
        String filterEmail = userEmail != null ? userEmail : email;
        
        List<Application> apps = filterEmail != null
            ? applicationRepository.findByEmail(filterEmail)
            : applicationRepository.findAll();

        List<Map<String, Object>> result = new ArrayList<>();
        RestTemplate restTemplate = new RestTemplate();

        for (Application app : apps) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", app.getId());
            item.put("status", app.getStatus());
            item.put("appliedDate", app.getAppliedDate());
            item.put("reviewedDate", app.getReviewedDate());
            item.put("interviewDate", app.getInterviewDate());
            item.put("interviewTime", app.getInterviewTime());
            item.put("notes", app.getNotes());
            item.put("resumeVersion", app.getResumeVersion());

            Map<String, Object> jobMap = new HashMap<>();
            if (app.getJobId() != null) {
                Optional<Job> jobOpt = jobRepository.findById(app.getJobId());
                if (jobOpt.isPresent()) {
                    Job job = jobOpt.get();
                    jobMap.put("title", job.getTitle());
                    jobMap.put("location", job.getLocation());
                    try {
                        Company company = restTemplate.getForObject(
                            "http://company-service:8082/companies/" + job.getCompanyId(), Company.class);
                        if (company != null) {
                            jobMap.put("company", Map.of("name", company.getName(), "id", company.getId()));
                        }
                    } catch (Exception e) {
                        jobMap.put("company", Map.of("name", "Company"));
                    }
                }
            }
            item.put("job", jobMap);
            result.add(item);
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/job/{jobId}")
    public ResponseEntity<List<Application>> getApplicationsByJob(@PathVariable Long jobId) {
        return ResponseEntity.ok(applicationRepository.findByJobId(jobId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable Long id) {
        return applicationRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/shortlist")
    public ResponseEntity<?> shortlist(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String recruiterId,
            @RequestHeader(value = "X-Company-Id", required = false) String headerCompanyId,
            @RequestHeader(value = "X-User-Role", required = false) String headerRole) {
        return applicationRepository.findById(id).map(app -> {
            if (!isAuthorizedForApp(app, headerCompanyId, headerRole)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Tenant isolation violation: you can only shortlist candidates for your own company"));
            }
            app.setStatus(ApplicationStatus.SHORTLISTED.name());
            app.setReviewedDate(LocalDateTime.now());
            applicationRepository.save(app);

            recordAudit(recruiterId, "RECRUITER", "CANDIDATE_SHORTLISTED", "APPLICATION", id,
                    "candidate=" + app.getEmail());

            try {
                Map<String, Object> event = buildApplicationEvent(app);
                event.put("eventId", "app-short-" + app.getId());
                event.put("nextSteps", "The hiring team will reach out shortly with details on the upcoming interview stages.");
                rabbitTemplate.convertAndSend(notificationExchange, "application.shortlisted", event);
            } catch (Exception ignored) {}
            return ResponseEntity.ok(Map.of("message", "Application shortlisted"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/reject")
    public ResponseEntity<?> reject(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, String> body,
            @RequestHeader(value = "X-User-Id", required = false) String recruiterId,
            @RequestHeader(value = "X-Company-Id", required = false) String headerCompanyId,
            @RequestHeader(value = "X-User-Role", required = false) String headerRole) {
        return applicationRepository.findById(id).map(app -> {
            if (!isAuthorizedForApp(app, headerCompanyId, headerRole)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Tenant isolation violation: you can only reject candidates for your own company"));
            }
            app.setStatus(ApplicationStatus.REJECTED.name());
            app.setReviewedDate(LocalDateTime.now());
            if (body != null && body.containsKey("notes")) {
                app.setNotes(body.get("notes"));
            }
            applicationRepository.save(app);

            recordAudit(recruiterId, "RECRUITER", "APPLICATION_REJECTED", "APPLICATION", id,
                    "candidate=" + app.getEmail());

            try {
                Map<String, Object> event = buildApplicationEvent(app);
                event.put("eventId", "app-rej-" + app.getId());
                if (body != null && body.containsKey("notes")) {
                    event.put("notes", body.get("notes"));
                }
                rabbitTemplate.convertAndSend(notificationExchange, "application.rejected", event);
            } catch (Exception ignored) {}

            return ResponseEntity.ok(Map.of("message", "Application rejected"));
        }).orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}/schedule-interview")
    public ResponseEntity<?> scheduleInterview(
            @PathVariable Long id, @RequestBody Map<String, String> body,
            @RequestHeader(value = "X-User-Id", required = false) String recruiterId,
            @RequestHeader(value = "X-Company-Id", required = false) String headerCompanyId,
            @RequestHeader(value = "X-User-Role", required = false) String headerRole) {
        return applicationRepository.findById(id).map(app -> {
            if (!isAuthorizedForApp(app, headerCompanyId, headerRole)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Tenant isolation violation: you can only schedule interviews for your own company"));
            }
            app.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED.name());
            app.setInterviewDate(LocalDateTime.parse(body.get("interviewDate")));
            app.setInterviewTime(body.get("interviewTime"));
            app.setInterviewLocation(body.get("interviewLocation"));
            applicationRepository.save(app);

            recordAudit(recruiterId, "RECRUITER", "INTERVIEW_SCHEDULED", "APPLICATION", id,
                    "candidate=" + app.getEmail() + ", date=" + body.get("interviewDate"));

            try {
                Map<String, Object> event = buildApplicationEvent(app);
                event.put("eventId", "interview-sched-app-" + app.getId() + "-" + System.currentTimeMillis());
                event.put("interviewDate", body.get("interviewDate"));
                event.put("interviewTime", body.get("interviewTime"));
                event.put("interviewType", body.getOrDefault("interviewType", "Technical Video Call"));
                event.put("meetingLink", body.get("interviewLocation") != null ? body.get("interviewLocation") : "");
                rabbitTemplate.convertAndSend(notificationExchange, "interview.scheduled", event);
            } catch (Exception ignored) {}
            return ResponseEntity.ok(Map.of("message", "Interview scheduled"));
        }).orElse(ResponseEntity.notFound().build());
    }

    private boolean isAuthorizedForApp(Application app, String headerCompanyId, String headerRole) {
        if ("RECRUITER".equals(headerRole) && headerCompanyId != null && !headerCompanyId.isBlank()) {
            Job job = jobRepository.findById(app.getJobId()).orElse(null);
            if (job != null && !Long.valueOf(headerCompanyId).equals(job.getCompanyId())) {
                return false;
            }
        }
        return true;
    }

    /**
     * Get applications for a company. TENANT ISOLATION: verifies recruiter's companyId.
     */
    @GetMapping("/company/{companyId}")
    public ResponseEntity<?> getApplicationsByCompany(
            @PathVariable Long companyId,
            @RequestHeader(value = "X-Company-Id", required = false) String headerCompanyId,
            @RequestHeader(value = "X-User-Role", required = false) String headerRole) {

        if ("RECRUITER".equals(headerRole) && headerCompanyId != null && !headerCompanyId.isBlank()) {
            if (!Long.valueOf(headerCompanyId).equals(companyId)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You can only view applications for your own company"));
            }
        }

        List<Job> jobs = jobRepository.findByCompanyId(companyId);
        if (jobs == null || jobs.isEmpty()) {
            return ResponseEntity.ok(Collections.emptyList());
        }
        Map<Long, Job> jobMap = new HashMap<>();
        for (Job j : jobs) {
            jobMap.put(j.getId(), j);
        }
        List<Long> jobIds = new ArrayList<>(jobMap.keySet());
        List<Application> apps = applicationRepository.findByJobIdIn(jobIds);

        List<Map<String, Object>> result = new ArrayList<>();
        for (Application app : apps) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", app.getId());
            item.put("jobId", app.getJobId());
            item.put("firstName", app.getFirstName());
            item.put("lastName", app.getLastName());
            item.put("email", app.getEmail());
            item.put("phone", app.getPhone());
            item.put("resumeUrl", app.getResumeUrl());
            item.put("coverLetter", app.getCoverLetter());
            item.put("status", app.getStatus());
            item.put("appliedDate", app.getAppliedDate());
            item.put("reviewedDate", app.getReviewedDate());
            item.put("interviewDate", app.getInterviewDate());
            item.put("interviewTime", app.getInterviewTime());
            item.put("interviewLocation", app.getInterviewLocation());
            item.put("notes", app.getNotes());
            item.put("resumeVersion", app.getResumeVersion());

            Job job = jobMap.get(app.getJobId());
            if (job != null) {
                item.put("jobTitle", job.getTitle());
                item.put("jobLocation", job.getLocation());
                item.put("jobType", job.getJobType());
            }
            result.add(item);
        }
        return ResponseEntity.ok(result);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Long id, @RequestBody Map<String, String> req,
            @RequestHeader(value = "X-User-Id", required = false) String actorId,
            @RequestHeader(value = "X-Company-Id", required = false) String headerCompanyId,
            @RequestHeader(value = "X-User-Role", required = false) String actorRole) {
        String nextStatus = req.get("status");
        if (nextStatus == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Target status is required"));
        }

        return applicationRepository.findById(id).map(app -> {
            if (!isAuthorizedForApp(app, headerCompanyId, actorRole)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Tenant isolation violation: you can only update candidates for your own company"));
            }
            String current = app.getStatus();
            if (!isValidTransition(current, nextStatus)) {
                return ResponseEntity.badRequest().body(
                    Map.of("message", "Invalid state transition from " + current + " to " + nextStatus));
            }
            app.setStatus(nextStatus);
            app.setReviewedDate(LocalDateTime.now());
            applicationRepository.save(app);

            recordAudit(actorId, actorRole != null ? actorRole : "SYSTEM",
                    "APPLICATION_STATUS_CHANGED", "APPLICATION", id,
                    "from=" + current + ", to=" + nextStatus);

            Map<String, Object> statusEvent = buildApplicationEvent(app);
            statusEvent.put("oldStatus", current);
            statusEvent.put("newStatus", nextStatus);
            recordOutbox("APPLICATION", id, "application.status.changed", statusEvent);

            try {
                rabbitTemplate.convertAndSend(notificationExchange, "application.status_changed", statusEvent);

                if ("SHORTLISTED".equalsIgnoreCase(nextStatus)) {
                    Map<String, Object> shortEvent = buildApplicationEvent(app);
                    shortEvent.put("eventId", "app-short-" + app.getId());
                    shortEvent.put("nextSteps", "The hiring team will reach out shortly with details on the upcoming interview stages.");
                    rabbitTemplate.convertAndSend(notificationExchange, "application.shortlisted", shortEvent);
                } else if ("REJECTED".equalsIgnoreCase(nextStatus)) {
                    Map<String, Object> rejEvent = buildApplicationEvent(app);
                    rejEvent.put("eventId", "app-rej-" + app.getId());
                    rabbitTemplate.convertAndSend(notificationExchange, "application.rejected", rejEvent);
                }
            } catch (Exception ignored) {}
            return ResponseEntity.ok(Map.of("message", "Status updated successfully", "status", nextStatus));
        }).orElse(ResponseEntity.notFound().build());
    }

    private boolean isValidTransition(String current, String target) {
        if (current == null || target == null) return false;
        if (current.equalsIgnoreCase(target)) return true;
        if ("REJECTED".equalsIgnoreCase(target) || "WITHDRAWN".equalsIgnoreCase(target)) return true;

        switch (current.toUpperCase()) {
            case "APPLIED":
                return "UNDER_REVIEW".equalsIgnoreCase(target) || "SHORTLISTED".equalsIgnoreCase(target);
            case "UNDER_REVIEW":
                return "SHORTLISTED".equalsIgnoreCase(target) || "INTERVIEW_SCHEDULED".equalsIgnoreCase(target);
            case "SHORTLISTED":
                return "INTERVIEW_SCHEDULED".equalsIgnoreCase(target);
            case "INTERVIEW_SCHEDULED":
                return "OFFER_EXTENDED".equalsIgnoreCase(target) || "SHORTLISTED".equalsIgnoreCase(target);
            case "OFFER_EXTENDED":
                return "ACCEPTED".equalsIgnoreCase(target) || "DECLINED".equalsIgnoreCase(target);
            default:
                return false;
        }
    }

    private Map<String, Object> buildApplicationEvent(Application app) {
        Map<String, Object> event = new HashMap<>();
        event.put("applicationId", app.getId());
        event.put("candidateEmail", app.getEmail());
        String name = ((app.getFirstName() != null ? app.getFirstName() : "") + 
                       (app.getLastName() != null ? " " + app.getLastName() : "")).trim();
        event.put("candidateName", !name.isBlank() ? name : "Candidate");
        event.put("jobId", app.getJobId());
        event.put("status", app.getStatus() != null ? app.getStatus() : "Applied");
        event.put("appliedAt", app.getAppliedDate() != null ? app.getAppliedDate().toString() : LocalDateTime.now().toString());

        String jobTitle = "Open Position";
        String companyName = "Company";
        if (app.getJobId() != null) {
            Job job = jobRepository.findById(app.getJobId()).orElse(null);
            if (job != null) {
                if (job.getTitle() != null && !job.getTitle().isBlank()) {
                    jobTitle = job.getTitle();
                }
                if (companyClient != null && job.getCompanyId() != null) {
                    try {
                        Company comp = companyClient.getCompanyById(job.getCompanyId());
                        if (comp != null && comp.getName() != null && !comp.getName().isBlank()) {
                            companyName = comp.getName();
                        }
                    } catch (Exception ignored) {}
                }
            }
        }
        event.put("jobTitle", jobTitle);
        event.put("companyName", companyName);
        return event;
    }

    private void recordAudit(String actorIdStr, String actorRole, String action,
                             String resourceType, Long resourceId, String metadata) {
        try {
            Long actorId = null;
            if (actorIdStr != null && !actorIdStr.isBlank()) {
                actorId = Long.valueOf(actorIdStr);
            }
            auditEventRepository.save(new AuditEvent(actorId, actorRole, action, resourceType, resourceId, metadata));
        } catch (Exception ignored) {}
    }

    private void recordOutbox(String aggregateType, Long aggregateId, String eventType, Object payload) {
        try {
            String json = new com.fasterxml.jackson.databind.ObjectMapper().writeValueAsString(payload);
            outboxEventRepository.save(new OutboxEvent(aggregateType, aggregateId, eventType, json));
        } catch (Exception ignored) {}
    }
}
