package com.tajfolio.auth.messaging;

import com.tajfolio.auth.model.User;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class AuthEventPublisher {

    private final RabbitTemplate rabbitTemplate;

    @Value("${rabbitmq.exchange.notification:notification.exchange}")
    private String notificationExchange;

    public AuthEventPublisher(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void publishUserRegistered(User user) {
        Map<String, Object> event = new HashMap<>();
        event.put("eventId", "user-reg-" + user.getId());
        event.put("userId", user.getId());
        event.put("email", user.getEmail());
        event.put("name", user.getName());
        event.put("role", user.getRole().name());
        rabbitTemplate.convertAndSend(notificationExchange, "user.registered", event);
    }

    public void publishRecruiterPending(User user) {
        Map<String, Object> event = new HashMap<>();
        event.put("email", user.getEmail());
        event.put("name", user.getName());
        rabbitTemplate.convertAndSend(notificationExchange, "recruiter.pending", event);
    }

    public void publishRecruiterApproved(User user) {
        Map<String, Object> event = new HashMap<>();
        event.put("email", user.getEmail());
        event.put("name", user.getName());
        rabbitTemplate.convertAndSend(notificationExchange, "recruiter.approved", event);
    }
}
