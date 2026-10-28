package com.tajfolio.notification.dto;

import com.fasterxml.jackson.annotation.JsonAlias;
import com.tajfolio.notification.model.NotificationType;
import java.util.Map;

public class EmailRequest {
    @JsonAlias({"recipient", "to", "email"})
    private String to;

    private String subject;
    private String message;
    private String eventId;

    @JsonAlias({"type", "notificationType"})
    private NotificationType type;

    @JsonAlias({"data", "templateData", "payload"})
    private Map<String, Object> templateData;

    public EmailRequest() {}

    public EmailRequest(String to, String subject, NotificationType type, Map<String, Object> templateData) {
        this.to = to;
        this.subject = subject;
        this.type = type;
        this.templateData = templateData;
    }

    public String getTo() { return to; }
    public void setTo(String to) { this.to = to; }

    public String getRecipient() { return to; }
    public void setRecipient(String recipient) { this.to = recipient; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getEventId() { return eventId; }
    public void setEventId(String eventId) { this.eventId = eventId; }

    public NotificationType getType() { return type; }
    public void setType(NotificationType type) { this.type = type; }

    public Map<String, Object> getTemplateData() { return templateData; }
    public void setTemplateData(Map<String, Object> templateData) { this.templateData = templateData; }

    public Map<String, Object> getData() { return templateData; }
    public void setData(Map<String, Object> data) { this.templateData = data; }
}
