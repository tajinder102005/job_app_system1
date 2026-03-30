package com.tajfolio.com.jobms.job;

import com.tajfolio.com.jobms.job.dto.JobWithCompanyDTO;
import java.util.List;

public interface JobService {
    List<JobWithCompanyDTO> findAll();

    void createJob(Job job);

    Job getJobById(Long id);

    boolean deleteJobById(Long id);

    boolean updateJob(Long id, Job updatedJob);
}
