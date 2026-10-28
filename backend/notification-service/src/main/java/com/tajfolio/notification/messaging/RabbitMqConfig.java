package com.tajfolio.notification.messaging;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.TopicExchange;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMqConfig {

    @Value("${rabbitmq.exchange.notification}")
    private String notificationExchange;

    @Value("${rabbitmq.queue.user.registered}")
    private String userRegisteredQueue;

    @Value("${rabbitmq.queue.recruiter.pending}")
    private String recruiterPendingQueue;

    @Value("${rabbitmq.queue.recruiter.approved}")
    private String recruiterApprovedQueue;

    @Value("${rabbitmq.queue.application.submitted}")
    private String applicationSubmittedQueue;

    @Value("${rabbitmq.queue.application.shortlisted}")
    private String applicationShortlistedQueue;

    @Value("${rabbitmq.queue.interview.scheduled}")
    private String interviewScheduledQueue;

    @Value("${rabbitmq.queue.application.rejected:application.rejected.queue}")
    private String applicationRejectedQueue;

    @Bean
    public TopicExchange notificationExchange() {
        return new TopicExchange(notificationExchange);
    }

    @Bean
    public Queue userRegisteredQueue() {
        return new Queue(userRegisteredQueue, true);
    }

    @Bean
    public Queue recruiterPendingQueue() {
        return new Queue(recruiterPendingQueue, true);
    }

    @Bean
    public Queue recruiterApprovedQueue() {
        return new Queue(recruiterApprovedQueue, true);
    }

    @Bean
    public Queue applicationSubmittedQueue() {
        return new Queue(applicationSubmittedQueue, true);
    }

    @Bean
    public Queue applicationShortlistedQueue() {
        return new Queue(applicationShortlistedQueue, true);
    }

    @Bean
    public Queue interviewScheduledQueue() {
        return new Queue(interviewScheduledQueue, true);
    }

    @Bean
    public Queue applicationRejectedQueue() {
        return new Queue(applicationRejectedQueue, true);
    }

    @Bean
    public Binding userRegisteredBinding() {
        return BindingBuilder.bind(userRegisteredQueue()).to(notificationExchange()).with("user.registered");
    }

    @Bean
    public Binding recruiterPendingBinding() {
        return BindingBuilder.bind(recruiterPendingQueue()).to(notificationExchange()).with("recruiter.pending");
    }

    @Bean
    public Binding recruiterApprovedBinding() {
        return BindingBuilder.bind(recruiterApprovedQueue()).to(notificationExchange()).with("recruiter.approved");
    }

    @Bean
    public Binding applicationSubmittedBinding() {
        return BindingBuilder.bind(applicationSubmittedQueue()).to(notificationExchange())
                .with("application.submitted");
    }

    @Bean
    public Binding applicationShortlistedBinding() {
        return BindingBuilder.bind(applicationShortlistedQueue()).to(notificationExchange())
                .with("application.shortlisted");
    }

    @Bean
    public Binding interviewScheduledBinding() {
        return BindingBuilder.bind(interviewScheduledQueue()).to(notificationExchange()).with("interview.scheduled");
    }

    @Bean
    public Binding applicationRejectedBinding() {
        return BindingBuilder.bind(applicationRejectedQueue()).to(notificationExchange()).with("application.rejected");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
