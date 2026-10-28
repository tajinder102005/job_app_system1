package com.tajfolio.com.jobms.job.messaging;

import com.tajfolio.com.jobms.job.Job;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class JobEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.job:job.exchange}")
    private String jobExchange;

    public JobEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishJobCreated(Job job) {
        Map<String, Object> event = buildJobEvent(job);
        rabbitTemplate.convertAndSend(jobExchange, "job.created", event);
    }

    public void publishJobUpdated(Job job) {
        Map<String, Object> event = buildJobEvent(job);
        rabbitTemplate.convertAndSend(jobExchange, "job.updated", event);
    }

    public void publishJobDeleted(Long jobId) {
        rabbitTemplate.convertAndSend(jobExchange, "job.deleted", jobId.toString());
    }

    private Map<String, Object> buildJobEvent(Job job) {
        Map<String, Object> event = new HashMap<>();
        event.put("id", job.getId().toString());
        event.put("title", job.getTitle());
        event.put("description", job.getDescription());
        event.put("location", job.getLocation());
        event.put("minSalary", job.getMinSalary());
        event.put("maxSalary", job.getMaxSalary());
        event.put("companyId", job.getCompanyId() != null ? job.getCompanyId().toString() : null);
        event.put("isActive", true);
        return event;
    }
}
