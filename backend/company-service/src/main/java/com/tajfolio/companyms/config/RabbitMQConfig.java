package com.tajfolio.companyms.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String COMPANY_QUEUE = "company.queue";
    public static final String COMPANY_EXCHANGE = "company.exchange";
    public static final String COMPANY_ROUTING_KEY = "company.routingkey";

    @Bean
    public Queue companyQueue() {
        return new Queue(COMPANY_QUEUE, true);
    }

    @Bean
    public TopicExchange companyExchange() {
        return new TopicExchange(COMPANY_EXCHANGE);
    }

    @Bean
    public Binding companyBinding() {
        return BindingBuilder
                .bind(companyQueue())
                .to(companyExchange())
                .with(COMPANY_ROUTING_KEY);
    }
}
