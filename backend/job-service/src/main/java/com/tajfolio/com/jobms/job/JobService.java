package com.tajfolio.com.jobms.job;

import com.tajfolio.com.jobms.job.dto.JobWithCompanyDTO;
import java.util.List;

public interface JobService {
    List<JobWithCompanyDTO> findAll();
    List<JobWithCompanyDTO> searchJobs(String keyword, String location, String jobType, String experienceLevel, String status);
    void createJob(Job job);
    Job getJobById(Long id);
    boolean deleteJobById(Long id);
    boolean updateJob(Long id, Job updatedJob);
    boolean closeJob(Long id);
    boolean openJob(Long id);
    List<JobWithCompanyDTO> findByCompanyId(Long companyId);
}
