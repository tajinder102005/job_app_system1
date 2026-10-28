package com.tajinder.reviewms.review.impl;

import com.tajinder.reviewms.review.Review;
import com.tajinder.reviewms.review.ReviewRepository;
import com.tajinder.reviewms.review.ReviewService;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.OptionalDouble;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRepository reviewRepository;
    private final RabbitTemplate rabbitTemplate;

    public ReviewServiceImpl(ReviewRepository reviewRepository, RabbitTemplate rabbitTemplate) {
        this.reviewRepository = reviewRepository;
        this.rabbitTemplate = rabbitTemplate;
    }

    @Override
    public List<Review> getAllReviews(Long companyId) {
        if (companyId == null) return List.of();
        return reviewRepository.findByCompanyId(companyId);
    }

    @Override
    public void addReview(Long companyId, Review review) {
        if (companyId == null || review == null) return;
        review.setCompanyId(companyId);
        reviewRepository.save(review);
        publishRatingUpdate(companyId);
    }

    @Override
    public Review getReviewById(Long reviewId) {
        if (reviewId == null) return null;
        return reviewRepository.findById(reviewId).orElse(null);
    }

    @Override
    public boolean updateReview(Long reviewId, Review updatedReview) {
        if (reviewId == null || updatedReview == null) return false;
        return reviewRepository.findById(reviewId).map(existing -> {
            existing.setRating(updatedReview.getRating());
            existing.setReviewText(updatedReview.getReviewText());
            if (updatedReview.getReviewerName() != null)
                existing.setReviewerName(updatedReview.getReviewerName());
            reviewRepository.save(existing);
            publishRatingUpdate(existing.getCompanyId());
            return true;
        }).orElse(false);
    }

    @Override
    public boolean deleteReview(Long reviewId) {
        if (reviewId == null || !reviewRepository.existsById(reviewId)) return false;
        Review review = reviewRepository.findById(reviewId).orElse(null);
        reviewRepository.deleteById(reviewId);
        if (review != null) publishRatingUpdate(review.getCompanyId());
        return true;
    }

    /** Recalculate average rating and publish to company.exchange */
    private void publishRatingUpdate(Long companyId) {
        try {
            List<Review> reviews = reviewRepository.findByCompanyId(companyId);
            OptionalDouble avg = reviews.stream().mapToDouble(Review::getRating).average();
            Map<String, Object> event = new HashMap<>();
            event.put("companyId", companyId);
            event.put("averageRating", avg.isPresent() ? Math.round(avg.getAsDouble() * 10.0) / 10.0 : 0.0);
            event.put("reviewCount", reviews.size());
            rabbitTemplate.convertAndSend("review.exchange", "review.rating.updated", event);
        } catch (Exception ignored) {}
    }
}
