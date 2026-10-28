package com.tajinder.reviewms.review;

import javax.persistence.*;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.LocalDateTime;

@Entity
@Table(name = "review")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    private Long id;

    private Long companyId;

    @JsonProperty("reviewerName")
    private String reviewerName;

    @JsonProperty("reviewerEmail")
    private String reviewerEmail;

    @JsonProperty("title")
    private String title;

    @JsonProperty("description")
    private String description;

    @JsonProperty("reviewText")
    private String reviewText;

    @JsonProperty("rating")
    private double rating;

    @JsonProperty("createdAt")
    private LocalDateTime createdAt = LocalDateTime.now();

    public Review() {}

    public Review(Long id, String reviewText, double rating) {
        this.id = id;
        this.reviewText = reviewText;
        this.rating = rating;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public String getReviewerName() { return reviewerName; }
    public void setReviewerName(String reviewerName) { this.reviewerName = reviewerName; }
    public String getReviewerEmail() { return reviewerEmail; }
    public void setReviewerEmail(String reviewerEmail) { this.reviewerEmail = reviewerEmail; }
    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getReviewText() {
        if (reviewText != null && !reviewText.isBlank()) return reviewText;
        if (description != null && !description.isBlank()) {
            return (title != null && !title.isBlank() ? title + ": " : "") + description;
        }
        return title;
    }
    public void setReviewText(String reviewText) { this.reviewText = reviewText; }
    public double getRating() { return rating; }
    public void setRating(double rating) { this.rating = rating; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
