package com.tajfolio.notification.controller;

import com.tajfolio.notification.dto.EmailRequest;
import com.tajfolio.notification.model.NotificationLog;
import com.tajfolio.notification.repository.NotificationLogRepository;
import com.tajfolio.notification.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final EmailService emailService;
    private final NotificationLogRepository logRepository;

    public NotificationController(EmailService emailService, 
                                 NotificationLogRepository logRepository) {
        this.emailService = emailService;
        this.logRepository = logRepository;
    }

    @PostMapping("/send")
    public ResponseEntity<?> sendEmail(@RequestBody EmailRequest request) {
        String target = request.getTo() != null && !request.getTo().isBlank()
                ? request.getTo() : request.getRecipient();
        if (target == null || target.isBlank()) {
            return ResponseEntity.badRequest().body(java.util.Map.of(
                "error", "Missing recipient. Please provide 'recipient' or 'to' field."
            ));
        }

        NotificationLog logEntry = emailService.sendEmail(request);
        return ResponseEntity.ok(java.util.Map.of(
            "status", logEntry != null ? logEntry.getStatus().name() : "SENT",
            "message", "Notification processed successfully",
            "recipient", target,
            "type", request.getType() != null ? request.getType().name() : "DEFAULT"
        ));
    }

    @GetMapping("/logs")
    public ResponseEntity<List<NotificationLog>> getAllLogs() {
        return ResponseEntity.ok(logRepository.findAll());
    }

    @GetMapping("/logs/recipient/{email}")
    public ResponseEntity<List<NotificationLog>> getLogsByRecipient(@PathVariable String email) {
        return ResponseEntity.ok(logRepository.findByRecipientOrderByCreatedAtDesc(email));
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        logRepository.findById(id).ifPresent(n -> {
            n.setRead(true);
            logRepository.save(n);
        });
        return ResponseEntity.ok().build();
    }

    @PutMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(@RequestParam String email) {
        List<NotificationLog> list = logRepository.findByRecipient(email);
        for (NotificationLog n : list) {
            n.setRead(true);
        }
        logRepository.saveAll(list);
        return ResponseEntity.ok().build();
    }
}
