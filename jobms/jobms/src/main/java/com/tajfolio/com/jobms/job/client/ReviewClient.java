package com.tajfolio.com.jobms.job.client;


import com.tajfolio.com.jobms.job.external.Review;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@FeignClient(name="Review-Service")
public interface ReviewClient {

    @GetMapping("/Review/{Id}")
    List<Review> getReview(@RequestParam("Id")Long companyId);

}
