package com.tajfolio.com.jobms.job.client;

import com.tajfolio.com.jobms.job.external.Review;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "review-service")
public interface ReviewClient {

    @GetMapping("/companies/{companyId}/reviews")
    List<Review> getReview(@PathVariable("companyId") Long companyId);

}
