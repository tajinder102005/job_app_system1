package com.tajfolio.com.jobms.job.controller;

import com.tajfolio.com.jobms.job.resume.Resume;
import com.tajfolio.com.jobms.job.resume.ResumeRepository;
import com.tajfolio.com.jobms.job.storage.StorageService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/resumes")
@CrossOrigin(origins = "*")
public class ResumeController {

    private final ResumeRepository resumeRepository;
    private final StorageService storageService;

    public ResumeController(ResumeRepository resumeRepository, StorageService storageService) {
        this.resumeRepository = resumeRepository;
        this.storageService = storageService;
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadResume(
            @RequestParam("file") MultipartFile file,
            @RequestHeader(value = "X-User-Email", required = false) String userEmail) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("message", "No file provided"));
        }

        // Validate file type
        String originalName = file.getOriginalFilename();
        if (originalName == null || !originalName.toLowerCase().endsWith(".pdf")) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "Only PDF files are allowed"));
        }

        // Validate file size (max 5MB)
        if (file.getSize() > 5 * 1024 * 1024) {
            return ResponseEntity.badRequest()
                .body(Map.of("message", "File size must not exceed 5MB"));
        }

        try {
            // Store through modular Object Storage Service (Local / S3 / MinIO)
            String storageKey = storageService.storeFile(file, "resumes/");

            // Auto-increment version for this candidate
            String candidateEmail = userEmail != null ? userEmail : "anonymous";
            Integer currentMax = resumeRepository.findMaxVersionByCandidateEmail(candidateEmail);
            int nextVersion = (currentMax != null ? currentMax : 0) + 1;

            // Create resume entity with version tracking
            Resume resume = new Resume();
            resume.setCandidateEmail(candidateEmail);
            resume.setFileName(originalName);
            resume.setStorageKey(storageKey);
            resume.setVersion(nextVersion);
            resume.setFileSize(file.getSize());
            Resume saved = resumeRepository.save(resume);

            String directUrl = "/resumes/" + storageKey;
            String presignedUrl = storageService.generatePresignedUrl(storageKey, 120);

            return ResponseEntity.ok(Map.of(
                "message", "Resume uploaded successfully to object storage",
                "resumeUrl", directUrl,
                "presignedUrl", presignedUrl,
                "filename", storageKey,
                "originalName", originalName,
                "version", String.valueOf(nextVersion),
                "resumeId", String.valueOf(saved.getId())
            ));

        } catch (IOException e) {
            return ResponseEntity.internalServerError()
                .body(Map.of("message", "Failed to upload resume: " + e.getMessage()));
        }
    }

    /**
     * List all resume versions for a candidate.
     */
    @GetMapping("/candidate/{email}")
    public ResponseEntity<List<Resume>> getResumeVersions(@PathVariable String email) {
        return ResponseEntity.ok(resumeRepository.findByCandidateEmailOrderByVersionDesc(email));
    }

    @GetMapping("/{filename}")
    public ResponseEntity<?> getResume(@PathVariable String filename) {
        try {
            byte[] content = storageService.loadFile(filename);
            return ResponseEntity.ok()
                .header("Content-Type", "application/pdf")
                .header("Content-Disposition", "inline; filename=\"" + filename + "\"")
                .body(content);

        } catch (IOException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/{filename}")
    public ResponseEntity<?> deleteResume(@PathVariable String filename) {
        boolean deleted = storageService.deleteFile(filename);
        if (deleted) {
            return ResponseEntity.ok(Map.of("message", "Resume deleted"));
        }
        return ResponseEntity.notFound().build();
    }
}

