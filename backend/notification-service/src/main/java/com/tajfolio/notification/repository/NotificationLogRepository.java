package com.tajfolio.notification.repository;

import com.tajfolio.notification.model.NotificationLog;
import com.tajfolio.notification.model.NotificationStatus;
import com.tajfolio.notification.model.NotificationType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificationLogRepository extends JpaRepository<NotificationLog, Long> {
    List<NotificationLog> findByRecipient(String recipient);
    List<NotificationLog> findByRecipientOrderByCreatedAtDesc(String recipient);
    boolean existsByEventId(String eventId);
    List<NotificationLog> findByStatus(NotificationStatus status);
    List<NotificationLog> findByType(NotificationType type);
    List<NotificationLog> findByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
}
