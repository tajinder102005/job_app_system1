package com.tajfolio.recommendation.client;

import com.tajfolio.recommendation.dto.JobDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.List;

@FeignClient(name = "job-service", path = "/jobs")
public interface JobServiceClient {
    
    @GetMapping
    List<JobDTO> getAllJobs();
    
    @GetMapping("/{id}")
    JobDTO getJobById(@PathVariable Long id);
}
