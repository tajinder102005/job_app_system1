package com.tajfolio.com.jobms.job.outbox;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.tajfolio.com.jobms.job.messaging.RabbitMqConfig;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class OutboxEventPublisher {

    private static final Logger log = LoggerFactory.getLogger(OutboxEventPublisher.class);

    private final OutboxEventRepository outboxRepository;
    private final RabbitTemplate rabbitTemplate;
    private final ObjectMapper objectMapper;

    public OutboxEventPublisher(OutboxEventRepository outboxRepository,
                                RabbitTemplate rabbitTemplate,
                                ObjectMapper objectMapper) {
        this.outboxRepository = outboxRepository;
        this.rabbitTemplate = rabbitTemplate;
        this.objectMapper = objectMapper;
    }

    @Scheduled(fixedDelay = 3000)
    public void processOutboxEvents() {
        List<OutboxEvent> pendingEvents = outboxRepository.findTop50ByStatusOrderByCreatedAtAsc("PENDING");
        if (pendingEvents.isEmpty()) return;

        log.debug("Processing {} pending transactional outbox events", pendingEvents.size());

        for (OutboxEvent event : pendingEvents) {
            try {
                String exchange = determineExchange(event.getAggregateType());
                String routingKey = event.getEventType();

                // Deserialize or send payload
                Object payloadObj;
                try {
                    payloadObj = objectMapper.readValue(event.getPayload(), Object.class);
                } catch (Exception e) {
                    payloadObj = event.getPayload();
                }

                rabbitTemplate.convertAndSend(exchange, routingKey, payloadObj);

                event.setStatus("SENT");
                event.setProcessedAt(LocalDateTime.now());
                outboxRepository.save(event);
                log.info("Outbox event [id={}] published to exchange [{}] with key [{}]", event.getId(), exchange, routingKey);

            } catch (Exception ex) {
                log.warn("Failed to publish outbox event [id={}]: {}", event.getId(), ex.getMessage());
                int retries = event.getRetryCount() + 1;
                event.setRetryCount(retries);
                event.setLastError(ex.getMessage() != null ? ex.getMessage() : "Publish error");

                if (retries >= 5) {
                    event.setStatus("FAILED");
                    // Route to Dead Letter Exchange
                    try {
                        rabbitTemplate.convertAndSend(RabbitMqConfig.DLX_EXCHANGE, RabbitMqConfig.DLQ_ROUTING_KEY, event.getPayload());
                        log.warn("Outbox event [id={}] exceeded retry limit and forwarded to DLQ", event.getId());
                    } catch (Exception ignored) {}
                }
                outboxRepository.save(event);
            }
        }
    }

    private String determineExchange(String aggregateType) {
        if ("JOB".equalsIgnoreCase(aggregateType)) {
            return "job.exchange";
        }
        return "application.exchange";
    }
}
