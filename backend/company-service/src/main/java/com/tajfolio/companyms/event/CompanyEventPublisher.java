package com.tajfolio.companyms.event;

import com.tajfolio.companyms.company.Company;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class CompanyEventPublisher {

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void publishCompanyCreatedEvent(Company company) {
        String message = "Company created: " + company.getName() + " with ID: " + company.getId();
        rabbitTemplate.convertAndSend("company.exchange", "company.routingkey", message);
    }

    public void publishCompanyUpdatedEvent(Company company) {
        String message = "Company updated: " + company.getName() + " with ID: " + company.getId();
        rabbitTemplate.convertAndSend("company.exchange", "company.routingkey", message);
    }

    public void publishCompanyDeletedEvent(Long companyId) {
        String message = "Company deleted with ID: " + companyId;
        rabbitTemplate.convertAndSend("company.exchange", "company.routingkey", message);
    }
}
