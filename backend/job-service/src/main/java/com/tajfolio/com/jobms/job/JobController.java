package com.tajfolio.com.jobms.job;

import com.tajfolio.com.jobms.job.dto.JobWithCompanyDTO;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import com.tajfolio.com.jobms.job.outbox.OutboxEvent;
import com.tajfolio.com.jobms.job.outbox.OutboxEventRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/jobs")
@CrossOrigin(origins = "*")
public class JobController {

    private final JobService jobService;
    private final JobRepository jobRepository;
    private final OutboxEventRepository outboxEventRepository;

    public JobController(JobService jobService, JobRepository jobRepository, OutboxEventRepository outboxEventRepository) {
        this.jobService = jobService;
        this.jobRepository = jobRepository;
        this.outboxEventRepository = outboxEventRepository;
    }

    @GetMapping
    public ResponseEntity<List<JobWithCompanyDTO>> findAll(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {
        List<JobWithCompanyDTO> all = jobService.findAll();
        if (page != null && size != null && size > 0) {
            int fromIndex = Math.min(page * size, all.size());
            int toIndex = Math.min(fromIndex + size, all.size());
            return ResponseEntity.ok(all.subList(fromIndex, toIndex));
        }
        return ResponseEntity.ok(all);
    }

    @GetMapping("/company/{companyId}")
    public ResponseEntity<List<JobWithCompanyDTO>> findByCompany(@PathVariable Long companyId) {
        return ResponseEntity.ok(jobService.findByCompanyId(companyId));
    }

    @GetMapping("/search")
    public ResponseEntity<List<JobWithCompanyDTO>> searchJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String jobType,
            @RequestParam(required = false) String experienceLevel,
            @RequestParam(required = false) String status) {
        return ResponseEntity.ok(jobService.searchJobs(keyword, location, jobType, experienceLevel, status));
    }

    /**
     * Create a new job listing.
     * TENANT ISOLATION: The backend enforces that the job's companyId must match
     * the recruiter's companyId from their JWT (injected as X-Company-Id by the gateway).
     * A recruiter from Company A CANNOT create jobs for Company B.
     */
    @PostMapping
    public ResponseEntity<?> createJob(
            @RequestBody Job job,
            @RequestHeader(value = "X-Company-Id", required = false) String headerCompanyId,
            @RequestHeader(value = "X-User-Id", required = false) String headerUserId,
            @RequestHeader(value = "X-User-Role", required = false) String headerRole) {

        // Enforce tenant isolation for recruiters
        if ("RECRUITER".equals(headerRole) && headerCompanyId != null && !headerCompanyId.isBlank()) {
            Long recruiterCompanyId = Long.valueOf(headerCompanyId);
            if (job.getCompanyId() == null) {
                // Auto-assign to recruiter's company
                job.setCompanyId(recruiterCompanyId);
            } else if (!recruiterCompanyId.equals(job.getCompanyId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "Tenant isolation violation: you can only create jobs for your own company"));
            }
        }

        // Set recruiter ID and publication timestamp
        if (headerUserId != null && !headerUserId.isBlank()) {
            try { job.setRecruiterId(Long.valueOf(headerUserId)); } catch (NumberFormatException ignored) {}
        }
        jobService.createJob(job);

        // Transactional Outbox: record job.created event
        try {
            String json = new ObjectMapper().writeValueAsString(job);
            outboxEventRepository.save(new OutboxEvent("JOB", job.getId(), "job.created", json));
        } catch (Exception ignored) {}

        return new ResponseEntity<>(Map.of("message", "Job added successfully"), HttpStatus.CREATED);
    }

    /**
     * Delete a job. TENANT ISOLATION: recruiter can only delete their own company's jobs.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteJob(
            @PathVariable Long id,
            @RequestHeader(value = "X-Company-Id", required = false) String headerCompanyId,
            @RequestHeader(value = "X-User-Role", required = false) String headerRole) {

        if ("RECRUITER".equals(headerRole)) {
            Job existing = jobService.getJobById(id);
            if (existing == null) return ResponseEntity.notFound().build();
            if (headerCompanyId != null && !headerCompanyId.isBlank()
                    && !Long.valueOf(headerCompanyId).equals(existing.getCompanyId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You can only delete jobs belonging to your company"));
            }
        }

        boolean deleted = jobService.deleteJobById(id);
        if (deleted) return ResponseEntity.ok(Map.of("message", "Job deleted successfully"));
        return ResponseEntity.notFound().build();
    }

    /**
     * Update a job. TENANT ISOLATION: recruiter can only update their own company's jobs.
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateJob(
            @PathVariable Long id,
            @RequestBody Job updatedJob,
            @RequestHeader(value = "X-Company-Id", required = false) String headerCompanyId,
            @RequestHeader(value = "X-User-Role", required = false) String headerRole) {

        if ("RECRUITER".equals(headerRole)) {
            Job existing = jobService.getJobById(id);
            if (existing == null) return ResponseEntity.notFound().build();
            if (headerCompanyId != null && !headerCompanyId.isBlank()
                    && !Long.valueOf(headerCompanyId).equals(existing.getCompanyId())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("error", "You can only update jobs belonging to your company"));
            }
        }

        boolean update = jobService.updateJob(id, updatedJob);
        if (update) return ResponseEntity.ok(Map.of("message", "Job updated successfully"));
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJobById(@PathVariable Long id) {
        Job job = jobService.getJobById(id);
        if (job != null) return new ResponseEntity<>(job, HttpStatus.OK);
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PutMapping("/{id}/close")
    public ResponseEntity<Map<String, String>> closeJob(@PathVariable Long id) {
        boolean closed = jobService.closeJob(id);
        if (closed) return ResponseEntity.ok(Map.of("message", "Job closed"));
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}/open")
    public ResponseEntity<Map<String, String>> openJob(@PathVariable Long id) {
        boolean opened = jobService.openJob(id);
        if (opened) return ResponseEntity.ok(Map.of("message", "Job opened"));
        return ResponseEntity.notFound().build();
    }
}
