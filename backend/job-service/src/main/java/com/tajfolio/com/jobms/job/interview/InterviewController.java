package com.tajfolio.com.jobms.job.interview;

import com.tajfolio.com.jobms.job.application.Application;
import com.tajfolio.com.jobms.job.application.ApplicationRepository;
import com.tajfolio.com.jobms.job.application.ApplicationStatus;
import com.tajfolio.com.jobms.job.Job;
import com.tajfolio.com.jobms.job.JobRepository;
import com.tajfolio.com.jobms.job.client.CompanyClient;
import com.tajfolio.com.jobms.job.external.Company;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/interviews")
@CrossOrigin(origins = "*")
public class InterviewController {

    private final InterviewRepository interviewRepository;
    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final CompanyClient companyClient;
    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.notification:notification.exchange}")
    private String notificationExchange;

    public InterviewController(InterviewRepository interviewRepository,
                               ApplicationRepository applicationRepository,
                               JobRepository jobRepository,
                               @Autowired(required = false) CompanyClient companyClient,
                               RabbitTemplate rabbitTemplate) {
        this.interviewRepository = interviewRepository;
        this.applicationRepository = applicationRepository;
        this.jobRepository = jobRepository;
        this.companyClient = companyClient;
        this.rabbitTemplate = rabbitTemplate;
    }

    /**
     * Schedule an interview. Creates Interview record and updates Application status.
     */
    @PostMapping
    public ResponseEntity<?> scheduleInterview(
            @RequestBody Map<String, Object> req,
            @RequestHeader(value = "X-User-Id", required = false) String recruiterId) {

        Long applicationId = req.get("applicationId") != null
                ? Long.valueOf(req.get("applicationId").toString()) : null;

        if (applicationId == null) {
            return ResponseEntity.badRequest().body(Map.of("error", "applicationId is required"));
        }

        Optional<Application> appOpt = applicationRepository.findById(applicationId);
        if (appOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Application app = appOpt.get();

        Interview interview = new Interview();
        interview.setApplicationId(applicationId);
        interview.setJobId(app.getJobId());
        interview.setCandidateEmail(app.getEmail());
        if (recruiterId != null && !recruiterId.isBlank()) {
            try { interview.setRecruiterId(Long.valueOf(recruiterId)); } catch (NumberFormatException ignored) {}
        }
        interview.setScheduledAt(req.get("scheduledAt") != null
                ? LocalDateTime.parse(req.get("scheduledAt").toString()) : LocalDateTime.now().plusDays(3));
        interview.setInterviewType((String) req.getOrDefault("interviewType", "TECHNICAL"));
        interview.setMeetingLink((String) req.getOrDefault("meetingLink",
                "https://meet.google.com/jobflow-" + UUID.randomUUID().toString().substring(0, 8)));
        interview.setStatus("SCHEDULED");

        Interview saved = interviewRepository.save(interview);

        // Update application status to INTERVIEW_SCHEDULED
        app.setStatus(ApplicationStatus.INTERVIEW_SCHEDULED.name());
        app.setInterviewDate(interview.getScheduledAt());
        app.setInterviewLocation(interview.getMeetingLink());
        applicationRepository.save(app);

        // Fetch job & company details for complete, null-free notification
        String jobTitle = "Open Position";
        String companyName = "Company";
        if (app.getJobId() != null) {
            Job job = jobRepository.findById(app.getJobId()).orElse(null);
            if (job != null) {
                if (job.getTitle() != null) jobTitle = job.getTitle();
                if (companyClient != null && job.getCompanyId() != null) {
                    try {
                        Company comp = companyClient.getCompanyById(job.getCompanyId());
                        if (comp != null && comp.getName() != null) companyName = comp.getName();
                    } catch (Exception ignored) {}
                }
            }
        }

        String candidateName = (app.getFirstName() != null ? app.getFirstName() : "") +
                (app.getLastName() != null ? " " + app.getLastName() : "");
        if (candidateName.isBlank()) candidateName = "Candidate";

        String dateStr = saved.getScheduledAt() != null ? saved.getScheduledAt().toLocalDate().toString() : "Interview details will be updated soon.";
        String timeStr = saved.getScheduledAt() != null ? saved.getScheduledAt().toLocalTime().toString() : "Interview details will be updated soon.";

        // Publish event
        try {
            Map<String, Object> event = new HashMap<>();
            event.put("eventId", "interview-sched-" + saved.getId());
            event.put("interviewId", saved.getId());
            event.put("applicationId", app.getId());
            event.put("candidateEmail", app.getEmail());
            event.put("candidateName", candidateName.trim());
            event.put("jobTitle", jobTitle);
            event.put("companyName", companyName);
            event.put("interviewDate", dateStr);
            event.put("interviewTime", timeStr);
            event.put("scheduledAt", saved.getScheduledAt().toString());
            event.put("interviewType", saved.getInterviewType());
            event.put("meetingLink", saved.getMeetingLink() != null ? saved.getMeetingLink() : "");
            rabbitTemplate.convertAndSend(notificationExchange, "interview.scheduled", event);
        } catch (Exception ignored) {}

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * Get interviews for a specific application.
     */
    @GetMapping("/application/{applicationId}")
    public ResponseEntity<List<Interview>> getByApplication(@PathVariable Long applicationId) {
        return ResponseEntity.ok(interviewRepository.findByApplicationId(applicationId));
    }

    /**
     * Get interviews for candidate — EXCLUDES internalNotes (recruiter-only).
     */
    @GetMapping("/candidate")
    public ResponseEntity<List<Map<String, Object>>> getCandidateInterviews(
            @RequestParam(required = false) String email,
            @RequestHeader(value = "X-User-Email", required = false) String headerEmail) {

        String candidateEmail = headerEmail != null ? headerEmail : email;
        if (candidateEmail == null) {
            return ResponseEntity.badRequest().body(Collections.emptyList());
        }

        List<Interview> interviews = interviewRepository.findByCandidateEmail(candidateEmail);

        // Strip internal notes — candidates must NOT see recruiter-only data
        List<Map<String, Object>> safe = interviews.stream().map(i -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", i.getId());
            m.put("applicationId", i.getApplicationId());
            m.put("jobId", i.getJobId());
            m.put("scheduledAt", i.getScheduledAt());
            m.put("interviewType", i.getInterviewType());
            m.put("meetingLink", i.getMeetingLink());
            m.put("status", i.getStatus());
            m.put("feedback", i.getFeedback()); // candidate-visible feedback only
            m.put("rating", i.getRating());
            // internalNotes deliberately excluded
            return m;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(safe);
    }

    /**
     * Get all interviews for a recruiter (full data including internal notes).
     */
    @GetMapping("/recruiter")
    public ResponseEntity<List<Interview>> getRecruiterInterviews(
            @RequestHeader(value = "X-User-Id", required = false) String recruiterId) {
        if (recruiterId == null) return ResponseEntity.ok(Collections.emptyList());
        try {
            return ResponseEntity.ok(interviewRepository.findByRecruiterId(Long.valueOf(recruiterId)));
        } catch (NumberFormatException e) {
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    /**
     * Submit feedback for an interview (recruiter only).
     */
    @PutMapping("/{id}/feedback")
    public ResponseEntity<?> submitFeedback(
            @PathVariable Long id,
            @RequestBody Map<String, Object> body) {

        return interviewRepository.findById(id).map(interview -> {
            interview.setFeedback((String) body.get("feedback"));
            if (body.get("rating") != null) {
                interview.setRating(Integer.valueOf(body.get("rating").toString()));
            }
            interview.setInternalNotes((String) body.get("internalNotes"));
            interview.setStatus("FEEDBACK_SUBMITTED");
            interviewRepository.save(interview);
            return ResponseEntity.ok(Map.of("message", "Feedback submitted successfully"));
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Cancel an interview.
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<?> cancelInterview(@PathVariable Long id) {
        return interviewRepository.findById(id).map(interview -> {
            interview.setStatus("CANCELLED");
            interviewRepository.save(interview);
            return ResponseEntity.ok(Map.of("message", "Interview cancelled"));
        }).orElse(ResponseEntity.notFound().build());
    }

    /**
     * Get a single interview by ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<Interview> getById(@PathVariable Long id) {
        return interviewRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
