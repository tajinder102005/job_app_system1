package com.tajinder.reviewms.review.impl;

import com.tajinder.reviewms.review.Review;
import com.tajinder.reviewms.review.ReviewRespository;
import com.tajinder.reviewms.review.ReviewService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReviewServiceImpl implements ReviewService {

    private final ReviewRespository reviewRespository;

    public ReviewServiceImpl(ReviewRespository reviewRespository) {
        this.reviewRespository = reviewRespository;
    }

    @Override
    public List<Review> getAllReviews(Long companyId) {
        if (companyId == null) {
            return List.of();
        }
        return reviewRespository.findByCompanyId(companyId);
    }

    @Override
    public void addReview(Long companyId, Review review) {
        if (companyId == null || review == null) {
            return;
        }
        review.setCompanyId(companyId);
        reviewRespository.save(review);
    }

    @Override
    public Review getReviewById(Long reviewId) {
        if (reviewId == null) {
            return null;
        }
        return reviewRespository.findById(reviewId).orElse(null);
    }

    @Override
    public boolean updateReview(Long reviewId, Review updatedReview) {
        if (reviewId == null || updatedReview == null) {
            return false;
        }

        return reviewRespository.findById(reviewId).map(existingReview -> {
            existingReview.setRating(updatedReview.getRating());
            existingReview.setReviewText(updatedReview.getReviewText());
            reviewRespository.save(existingReview);
            return true;
        }).orElse(false);
    }

    @Override
    public boolean deleteReview(Long reviewId) {
        if (reviewId == null || !reviewRespository.existsById(reviewId)) {
            return false;
        }

        reviewRespository.deleteById(reviewId);
        return true;
    }
}