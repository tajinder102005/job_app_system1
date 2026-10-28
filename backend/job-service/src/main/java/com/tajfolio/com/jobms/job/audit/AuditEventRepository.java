package com.tajfolio.com.jobms.job.audit;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AuditEventRepository extends JpaRepository<AuditEvent, Long> {
    List<AuditEvent> findByActorId(Long actorId);
    List<AuditEvent> findByAction(String action);
    List<AuditEvent> findByResourceType(String resourceType);
    List<AuditEvent> findByResourceTypeAndResourceId(String resourceType, Long resourceId);
    Page<AuditEvent> findAllByOrderByTimestampDesc(Pageable pageable);
    List<AuditEvent> findTop50ByOrderByTimestampDesc();
}
