package com.tajfolio.com.jobms.job.savedjob;

import com.tajfolio.com.jobms.job.Job;
import com.tajfolio.com.jobms.job.JobRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/jobs/saved")
@CrossOrigin(origins = "*")
public class SavedJobController {

    private final SavedJobRepository savedJobRepository;
    private final JobRepository jobRepository;

    public SavedJobController(SavedJobRepository savedJobRepository, JobRepository jobRepository) {
        this.savedJobRepository = savedJobRepository;
        this.jobRepository = jobRepository;
    }

    @PostMapping("/{jobId}")
    public ResponseEntity<Map<String, String>> saveJob(
            @PathVariable Long jobId,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {

        Long userId = parseUserId(userIdHeader);

        if (savedJobRepository.existsByUserIdAndJobId(userId, jobId)) {
            return ResponseEntity.ok(Map.of("message", "Job already saved"));
        }

        if (!jobRepository.existsById(jobId)) {
            return ResponseEntity.notFound().build();
        }

        savedJobRepository.save(new SavedJob(userId, jobId));
        return ResponseEntity.ok(Map.of("message", "Job saved successfully"));
    }

    @DeleteMapping("/{jobId}")
    @Transactional
    public ResponseEntity<Map<String, String>> unsaveJob(
            @PathVariable Long jobId,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {

        Long userId = parseUserId(userIdHeader);
        savedJobRepository.deleteByUserIdAndJobId(userId, jobId);
        return ResponseEntity.ok(Map.of("message", "Job removed from saved list"));
    }

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getSavedJobs(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {

        Long userId = parseUserId(userIdHeader);
        List<SavedJob> savedJobs = savedJobRepository.findByUserId(userId);

        List<Map<String, Object>> result = new ArrayList<>();
        for (SavedJob saved : savedJobs) {
            jobRepository.findById(saved.getJobId()).ifPresent(job -> {
                Map<String, Object> item = new HashMap<>();
                item.put("savedJobId", saved.getId());
                item.put("savedAt",    saved.getSavedAt());
                item.put("jobId",      job.getId());
                item.put("title",      job.getTitle());
                item.put("location",   job.getLocation());
                item.put("minSalary",  job.getMinSalary());
                item.put("maxSalary",  job.getMaxSalary());
                result.add(item);
            });
        }
        return ResponseEntity.ok(result);
    }

    @GetMapping("/check/{jobId}")
    public ResponseEntity<Map<String, Boolean>> isJobSaved(
            @PathVariable Long jobId,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {

        Long userId = parseUserId(userIdHeader);
        boolean saved = savedJobRepository.existsByUserIdAndJobId(userId, jobId);
        return ResponseEntity.ok(Map.of("saved", saved));
    }

    // Fallback userId if gateway doesn't inject the header (local dev)
    private Long parseUserId(String userIdHeader) {
        if (userIdHeader == null || userIdHeader.isBlank() || "null".equals(userIdHeader)) {
            return 1L; // dev fallback
        }
        try {
            return Long.parseLong(userIdHeader);
        } catch (NumberFormatException e) {
            return 1L;
        }
    }
}
