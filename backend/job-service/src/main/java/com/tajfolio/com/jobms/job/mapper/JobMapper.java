package com.tajfolio.com.jobms.job.mapper;

import com.tajfolio.com.jobms.job.Job;
import com.tajfolio.com.jobms.job.dto.JobWithCompanyDTO;
import com.tajfolio.com.jobms.job.external.Company;

public class JobMapper {
    public static JobWithCompanyDTO MaptoJobWithCompanyDTO(Job job, Company company) {
        JobWithCompanyDTO dto = new JobWithCompanyDTO();
        dto.setJob(job);
        dto.setCompany(company);
        return dto;
    }
}
