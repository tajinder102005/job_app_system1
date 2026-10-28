package com.tajfolio.com.jobms.job.audit;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/audit")
@CrossOrigin(origins = "*")
public class AuditController {

    private final AuditEventRepository auditEventRepository;

    public AuditController(AuditEventRepository auditEventRepository) {
        this.auditEventRepository = auditEventRepository;
    }

    /**
     * Record an audit event.
     */
    @PostMapping("/events")
    public ResponseEntity<AuditEvent> recordEvent(@RequestBody AuditEvent event) {
        AuditEvent saved = auditEventRepository.save(event);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * Get recent audit events (admin-only in production).
     */
    @GetMapping("/events")
    public ResponseEntity<List<AuditEvent>> getEvents(
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String resourceType,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size) {

        List<AuditEvent> list;
        if (action != null) {
            list = auditEventRepository.findByAction(action);
        } else if (resourceType != null) {
            list = auditEventRepository.findByResourceType(resourceType);
        } else {
            list = auditEventRepository.findTop50ByOrderByTimestampDesc();
        }

        if (page != null && size != null && size > 0) {
            int fromIndex = Math.min(page * size, list.size());
            int toIndex = Math.min(fromIndex + size, list.size());
            return ResponseEntity.ok(list.subList(fromIndex, toIndex));
        }
        return ResponseEntity.ok(list);
    }

    /**
     * Get audit events for a specific resource.
     */
    @GetMapping("/events/{resourceType}/{resourceId}")
    public ResponseEntity<List<AuditEvent>> getByResource(
            @PathVariable String resourceType,
            @PathVariable Long resourceId) {
        return ResponseEntity.ok(
            auditEventRepository.findByResourceTypeAndResourceId(resourceType, resourceId));
    }
}
