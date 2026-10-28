package com.tajfolio.notification.service;

import com.tajfolio.notification.dto.EmailRequest;
import com.tajfolio.notification.model.NotificationLog;
import com.tajfolio.notification.model.NotificationStatus;
import com.tajfolio.notification.repository.NotificationLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.context.Context;
import org.thymeleaf.spring5.SpringTemplateEngine;

import javax.mail.internet.MimeMessage;
import java.time.LocalDateTime;

@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;
    private final SpringTemplateEngine templateEngine;
    private final NotificationLogRepository logRepository;

    @Value("${spring.mail.username:tajindersingh.dev@gmail.com}")
    private String fromEmail;

    public EmailService(JavaMailSender mailSender, 
                       SpringTemplateEngine templateEngine,
                       NotificationLogRepository logRepository) {
        this.mailSender = mailSender;
        this.templateEngine = templateEngine;
        this.logRepository = logRepository;
    }

    public NotificationLog sendEmail(EmailRequest request) {
        // Resolve recipient
        String recipient = request.getTo() != null && !request.getTo().isBlank()
                ? request.getTo() : request.getRecipient();
        if (recipient == null || recipient.isBlank()) {
            log.warn("Cannot send email: recipient is null or empty");
            return null;
        }
        request.setTo(recipient);

        // Resolve subject dynamically if not provided
        if (request.getSubject() == null || request.getSubject().isBlank()) {
            request.setSubject(resolveDefaultSubject(request.getType(), request.getTemplateData()));
        }

        // 1. Idempotency check: Skip duplicate events if eventId is present
        if (request.getEventId() != null && !request.getEventId().isBlank()) {
            if (logRepository.existsByEventId(request.getEventId())) {
                log.info("Duplicate notification event [{}] already processed. Skipping.", request.getEventId());
                return null;
            }
        }

        // 2. Prepare in-app notification & email log
        NotificationLog notificationLog = new NotificationLog();
        notificationLog.setRecipient(request.getTo());
        notificationLog.setSubject(request.getSubject());
        notificationLog.setTitle(request.getSubject());
        notificationLog.setMessage(request.getMessage() != null && !request.getMessage().isBlank()
                ? request.getMessage() : request.getSubject());
        notificationLog.setType(request.getType());
        notificationLog.setStatus(NotificationStatus.PENDING);
        notificationLog.setEventId(request.getEventId());
        notificationLog.setChannel("EMAIL & IN_APP");

        try {
            // 3. Process HTML template
            String htmlContent = processTemplate(request);
            notificationLog.setBody(htmlContent);
            
            // 4. Send email via JavaMailSender
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setFrom(fromEmail);
            helper.setTo(request.getTo());
            helper.setSubject(request.getSubject());
            helper.setText(htmlContent, true);
            
            mailSender.send(message);
            
            notificationLog.setStatus(NotificationStatus.SENT);
            notificationLog.setSentAt(LocalDateTime.now());
            log.info("Outbound email successfully sent to [{}] for type [{}]", request.getTo(), request.getType());
            
        } catch (Exception e) {
            // 5. Reliability: Email failure does NOT crash consumer or roll back application
            notificationLog.setStatus(NotificationStatus.FAILED);
            String msg = e.getMessage() != null ? e.getMessage() : e.toString();
            notificationLog.setErrorMessage(msg.length() > 2000 ? msg.substring(0, 2000) : msg);
            log.warn("Notice: Outbound SMTP email failed for [{}] (in-app notification preserved): {}", request.getTo(), e.getMessage());
        } finally {
            // 6. In-app notification is reliably persisted
            notificationLog = logRepository.save(notificationLog);
        }

        return notificationLog;
    }

    private String processTemplate(EmailRequest request) {
        Context context = new Context();
        
        if (request.getTemplateData() != null) {
            java.util.Map<String, Object> data = new java.util.HashMap<>(request.getTemplateData());
            // Cross-map common keys so templates always resolve candidateName / name
            if (data.containsKey("candidateName") && !data.containsKey("name")) {
                data.put("name", data.get("candidateName"));
            } else if (data.containsKey("name") && !data.containsKey("candidateName")) {
                data.put("candidateName", data.get("name"));
            }
            data.forEach(context::setVariable);
        }
        
        String templateName = getTemplateName(request.getType());
        return templateEngine.process(templateName, context);
    }

    private String resolveDefaultSubject(com.tajfolio.notification.model.NotificationType type, java.util.Map<String, Object> data) {
        String jobTitle = data != null && data.get("jobTitle") != null ? data.get("jobTitle").toString() : "Position";
        String company = data != null && data.get("companyName") != null ? data.get("companyName").toString() : "JobFlow Partner";
        if (type == null) return "JobFlow Notification";
        switch (type) {
            case WELCOME:
            case REGISTRATION_SUCCESS:
                return "Welcome to JobFlow!";
            case RECRUITER_REQUEST_PENDING:
                return "Recruiter Account Request Received - Under Review";
            case RECRUITER_APPROVED:
                return "Congratulations! Your Recruiter Account Has Been Approved";
            case RECRUITER_REJECTED:
                return "Update Regarding Your Recruiter Account Request";
            case ADMIN_PROMOTED:
                return "Security Notice: Granted Administrator Privileges";
            case ACCOUNT_SUSPENDED:
                return "JobFlow Notice: Account Suspended";
            case ACCOUNT_ACTIVATED:
                return "JobFlow Notice: Account Re-activated";
            case APPLICATION_SUBMITTED:
                return "Application Submitted - " + jobTitle;
            case APPLICATION_SHORTLISTED:
                return "Good News! You've Been Shortlisted for " + jobTitle + " at " + company;
            case APPLICATION_REJECTED:
                return "Application Status Update - " + jobTitle;
            case INTERVIEW_SCHEDULED:
                return "Interview Scheduled - " + jobTitle + " at " + company;
            case JOB_POSTED:
                return "New Job Opportunity: " + jobTitle;
            case JOB_UPDATED:
                return "Job Listing Updated: " + jobTitle;
            case PASSWORD_RESET:
                return "JobFlow Password Reset Verification";
            default:
                return "JobFlow Platform Notification";
        }
    }

    private String getTemplateName(com.tajfolio.notification.model.NotificationType type) {
        if (type == null) return "default-notification";
        switch (type) {
            case WELCOME:
            case REGISTRATION_SUCCESS:
                return "welcome";
            case RECRUITER_REQUEST_PENDING:
                return "recruiter-pending";
            case RECRUITER_APPROVED:
                return "recruiter-approved";
            case RECRUITER_REJECTED:
                return "recruiter-rejected";
            case ADMIN_PROMOTED:
                return "admin-promoted";
            case ACCOUNT_SUSPENDED:
                return "account-suspended";
            case ACCOUNT_ACTIVATED:
                return "account-activated";
            case APPLICATION_SUBMITTED:
                return "application-submitted";
            case APPLICATION_SHORTLISTED:
                return "application-shortlisted";
            case APPLICATION_REJECTED:
                return "application-rejected";
            case INTERVIEW_SCHEDULED:
                return "interview-scheduled";
            case JOB_POSTED:
                return "job-posted";
            case JOB_UPDATED:
                return "job-updated";
            case PASSWORD_RESET:
                return "password-reset";
            default:
                return "default-notification";
        }
    }
}
