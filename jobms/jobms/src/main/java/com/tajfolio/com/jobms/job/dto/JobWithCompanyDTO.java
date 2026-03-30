package com.tajfolio.com.jobms.job.dto;

import com.tajfolio.com.jobms.job.Job;
import com.tajfolio.com.jobms.job.external.Company;

public class JobWithCompanyDTO {
    private Job job;
    private Company company;

    private Long id;
    private String title;
    private String description;
    private String minSalary;
    private String maxSalary;
    private String location;
    private Long companyId;


    public Job getJob() {
        return job;
    }

    public void setJob(Job job) {
        this.job = job;
    }

    public Company getCompany() {
        return company;
    }

    public void setCompany(Company company) {
        this.company = company;
    }
}
