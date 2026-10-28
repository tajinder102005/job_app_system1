package com.tajfolio.notification.messaging;

import com.tajfolio.notification.dto.EmailRequest;
import com.tajfolio.notification.model.NotificationType;
import com.tajfolio.notification.service.EmailService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Component
public class NotificationEventConsumer {

    private static final Logger log = LoggerFactory.getLogger(NotificationEventConsumer.class);

    private final EmailService emailService;

    public NotificationEventConsumer(EmailService emailService) {
        this.emailService = emailService;
    }

    /**
     * 1. USER REGISTRATION
     * In-app: "Welcome to Job Application System!"
     * Subject: "Welcome to Job Application System"
     */
    @RabbitListener(queues = "${rabbitmq.queue.user.registered}")
    public void handleUserRegistered(Map<String, Object> eventData) {
        String email = (String) eventData.get("email");
        String name = (String) eventData.get("name");
        String role = (String) eventData.get("role");
        String eventId = (String) eventData.get("eventId");

        log.info("Received user.registered event for email: [{}]", email);

        Map<String, Object> templateData = new HashMap<>();
        templateData.put("name", name != null ? name : "User");
        templateData.put("role", role != null ? role : "Member");

        EmailRequest request = new EmailRequest();
        request.setTo(email);
        request.setSubject("Welcome to Job Application System");
        request.setMessage("Welcome to Job Application System!");
        request.setType(NotificationType.WELCOME);
        request.setEventId(eventId);
        request.setTemplateData(templateData);

        emailService.sendEmail(request);
    }

    /**
     * 2. APPLICATION SUBMITTED
     * In-app: "Application Submitted Successfully"
     * Subject: "Application Submitted - [Job Title]"
     * Includes: user name, job title, company name, application date, status = Applied
     */
    @RabbitListener(queues = "${rabbitmq.queue.application.submitted}")
    public void handleApplicationSubmitted(Map<String, Object> eventData) {
        String email = (String) eventData.get("candidateEmail");
        String name = (String) eventData.get("candidateName");
        String jobTitle = (String) eventData.get("jobTitle");
        String companyName = (String) eventData.get("companyName");
        String applicationDate = (String) eventData.get("appliedAt");
        String eventId = (String) eventData.get("eventId");

        if (applicationDate == null) {
            applicationDate = LocalDate.now().toString();
        } else if (applicationDate.contains("T")) {
            applicationDate = applicationDate.substring(0, applicationDate.indexOf("T"));
        }

        String safeJobTitle = (jobTitle != null && !jobTitle.isBlank()) ? jobTitle : "Position";
        String safeCompany = (companyName != null && !companyName.isBlank()) ? companyName : "Company";

        log.info("Received application.submitted event for candidate: [{}] on job: [{}]", email, safeJobTitle);

        Map<String, Object> templateData = new HashMap<>();
        templateData.put("name", name != null ? name : "Candidate");
        templateData.put("jobTitle", safeJobTitle);
        templateData.put("companyName", safeCompany);
        templateData.put("applicationDate", applicationDate);
        templateData.put("status", "Applied");

        EmailRequest request = new EmailRequest();
        request.setTo(email);
        request.setSubject("Application Submitted - " + safeJobTitle);
        request.setMessage("Application Submitted Successfully");
        request.setType(NotificationType.APPLICATION_SUBMITTED);
        request.setEventId(eventId);
        request.setTemplateData(templateData);

        emailService.sendEmail(request);
    }

    /**
     * 3. APPLICATION SHORTLISTED
     * In-app: "Good News! You've Been Shortlisted"
     * Subject: "You've Been Shortlisted - [Job Title]"
     * Includes: user name, job title, company name, next steps
     */
    @RabbitListener(queues = "${rabbitmq.queue.application.shortlisted}")
    public void handleApplicationShortlisted(Map<String, Object> eventData) {
        String email = (String) eventData.get("candidateEmail");
        String name = (String) eventData.get("candidateName");
        String jobTitle = (String) eventData.get("jobTitle");
        String companyName = (String) eventData.get("companyName");
        String nextSteps = (String) eventData.get("nextSteps");
        String eventId = (String) eventData.get("eventId");

        String safeJobTitle = (jobTitle != null && !jobTitle.isBlank()) ? jobTitle : "Position";
        String safeCompany = (companyName != null && !companyName.isBlank()) ? companyName : "Company";

        log.info("Received application.shortlisted event for candidate: [{}]", email);

        Map<String, Object> templateData = new HashMap<>();
        templateData.put("name", name != null ? name : "Candidate");
        templateData.put("jobTitle", safeJobTitle);
        templateData.put("companyName", safeCompany);
        templateData.put("nextSteps", nextSteps != null ? nextSteps : "The hiring team will reach out soon with interview details.");

        EmailRequest request = new EmailRequest();
        request.setTo(email);
        request.setSubject("You've Been Shortlisted - " + safeJobTitle);
        request.setMessage("Good News! You've Been Shortlisted");
        request.setType(NotificationType.APPLICATION_SHORTLISTED);
        request.setEventId(eventId);
        request.setTemplateData(templateData);

        emailService.sendEmail(request);
    }

    /**
     * 4. INTERVIEW SCHEDULED
     * In-app: "Interview Scheduled - [Job Title]"
     * Subject: "Interview Scheduled - [Job Title]"
     * Includes: job title, company, interview date, interview time, interview type/mode, meeting link
     * Guaranteed no "null" displays.
     */
    @RabbitListener(queues = "${rabbitmq.queue.interview.scheduled}")
    public void handleInterviewScheduled(Map<String, Object> eventData) {
        String email = (String) eventData.get("candidateEmail");
        String name = (String) eventData.get("candidateName");
        String jobTitle = (String) eventData.get("jobTitle");
        String companyName = (String) eventData.get("companyName");
        String interviewDate = (String) eventData.get("interviewDate");
        String interviewTime = (String) eventData.get("interviewTime");
        String interviewType = (String) eventData.get("interviewType");
        String meetingLink = (String) eventData.get("meetingLink");
        String eventId = (String) eventData.get("eventId");

        String safeJobTitle = (jobTitle != null && !jobTitle.isBlank() && !jobTitle.equals("null")) ? jobTitle : "Position";
        String safeCompany = (companyName != null && !companyName.isBlank() && !companyName.equals("null")) ? companyName : "Company";
        String fallbackMsg = "Interview details will be updated soon.";

        String safeDate = (interviewDate != null && !interviewDate.isBlank() && !interviewDate.equals("null")) ? interviewDate : fallbackMsg;
        String safeTime = (interviewTime != null && !interviewTime.isBlank() && !interviewTime.equals("null")) ? interviewTime : fallbackMsg;
        String safeType = (interviewType != null && !interviewType.isBlank() && !interviewType.equals("null")) ? interviewType : "Online Video Meeting";
        String safeLink = (meetingLink != null && !meetingLink.isBlank() && !meetingLink.equals("null")) ? meetingLink : "";

        log.info("Received interview.scheduled event for candidate: [{}]", email);

        Map<String, Object> templateData = new HashMap<>();
        templateData.put("name", (name != null && !name.isBlank() && !name.equals("null")) ? name : "Candidate");
        templateData.put("jobTitle", safeJobTitle);
        templateData.put("companyName", safeCompany);
        templateData.put("interviewDate", safeDate);
        templateData.put("interviewTime", safeTime);
        templateData.put("interviewType", safeType);
        templateData.put("meetingLink", safeLink);

        EmailRequest request = new EmailRequest();
        request.setTo(email);
        request.setSubject("Interview Scheduled - " + safeJobTitle);
        request.setMessage("Interview Scheduled - " + safeJobTitle);
        request.setType(NotificationType.INTERVIEW_SCHEDULED);
        request.setEventId(eventId);
        request.setTemplateData(templateData);

        emailService.sendEmail(request);
    }

    /**
     * 5. APPLICATION REJECTED
     * In-app: "Application Status Update - [Job Title]"
     * Subject: "Application Status Update - [Job Title]"
     * Professional and respectful tone.
     */
    @RabbitListener(queues = "${rabbitmq.queue.application.rejected}")
    public void handleApplicationRejected(Map<String, Object> eventData) {
        String email = (String) eventData.get("candidateEmail");
        String name = (String) eventData.get("candidateName");
        String jobTitle = (String) eventData.get("jobTitle");
        String companyName = (String) eventData.get("companyName");
        String eventId = (String) eventData.get("eventId");

        String safeJobTitle = (jobTitle != null && !jobTitle.isBlank() && !jobTitle.equals("null")) ? jobTitle : "Position";
        String safeCompany = (companyName != null && !companyName.isBlank() && !companyName.equals("null")) ? companyName : "Company";

        log.info("Received application.rejected event for candidate: [{}]", email);

        Map<String, Object> templateData = new HashMap<>();
        templateData.put("name", (name != null && !name.isBlank() && !name.equals("null")) ? name : "Candidate");
        templateData.put("jobTitle", safeJobTitle);
        templateData.put("companyName", safeCompany);

        EmailRequest request = new EmailRequest();
        request.setTo(email);
        request.setSubject("Application Status Update - " + safeJobTitle);
        request.setMessage("Application Status Update - " + safeJobTitle);
        request.setType(NotificationType.APPLICATION_REJECTED);
        request.setEventId(eventId);
        request.setTemplateData(templateData);

        emailService.sendEmail(request);
    }

    @RabbitListener(queues = "${rabbitmq.queue.recruiter.pending}")
    public void handleRecruiterPending(Map<String, Object> eventData) {
        String email = (String) eventData.get("email");
        String name = (String) eventData.get("name");

        Map<String, Object> templateData = new HashMap<>();
        templateData.put("name", name);

        EmailRequest request = new EmailRequest();
        request.setTo(email);
        request.setSubject("Recruiter Request Pending Approval");
        request.setMessage("Recruiter Request Pending Approval");
        request.setType(NotificationType.RECRUITER_REQUEST_PENDING);
        request.setTemplateData(templateData);

        emailService.sendEmail(request);
    }

    @RabbitListener(queues = "${rabbitmq.queue.recruiter.approved}")
    public void handleRecruiterApproved(Map<String, Object> eventData) {
        String email = (String) eventData.get("email");
        String name = (String) eventData.get("name");

        Map<String, Object> templateData = new HashMap<>();
        templateData.put("name", name);

        EmailRequest request = new EmailRequest();
        request.setTo(email);
        request.setSubject("Recruiter Account Approved");
        request.setMessage("Recruiter Account Approved");
        request.setType(NotificationType.RECRUITER_APPROVED);
        request.setTemplateData(templateData);

        emailService.sendEmail(request);
    }
}
