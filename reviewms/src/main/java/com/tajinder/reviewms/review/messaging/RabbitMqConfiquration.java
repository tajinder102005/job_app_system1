package com.tajinder.reviewms.review.messaging;

import java.util.Queue;


public class RabbitMqConfiquration {
    @Bean
    public Queue companyQueue() {
        return new Queue("companyQueue", false);
    }
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(final ConnectionFactory connectionFactory) {
        RabbitTemplate rabbitTemplate = new RabbitTemplate(connectionFactory);
        rabbitTemplate.setMessageConverter(jsonMessageConverter());
        return rabbitTemplate;
    }
}
