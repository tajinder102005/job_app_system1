package com.tajfolio.com.jobms.job.mapper;

public class JobMapper {
    public static JobWithCompanyDTO MaptoJobWithCompanyDTO(Job job, Company company) {
        JobWithCompanyDTO dto = new JobWithCompanyDTO();
        dto.setJob(job);
        dto.setCompany(company);
        dto.setId(job.getId());
        dto.setTitle(job.getTitle());
        dto.setDescription(job.getDescription());
        dto.setMinSalary(job.getMinSalary());
        dto.setMaxSalary(job.getMaxSalary());
        dto.setLocation(job.getLocation());
        dto.setCompanyId(job.getCompanyId());
        return dto;
    }
}
