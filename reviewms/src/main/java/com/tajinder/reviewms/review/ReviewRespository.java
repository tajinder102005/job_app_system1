package com.tajinder.reviewms.review;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRespository extends JpaRepository<Review, Long> {
    List<Review> findByCompanyId(Long companyId);
}
