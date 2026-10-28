package com.tajfolio.com.jobms.job.impl;

import com.tajfolio.com.jobms.job.Job;
import com.tajfolio.com.jobms.job.JobRepository;
import com.tajfolio.com.jobms.job.JobService;
import com.tajfolio.com.jobms.job.client.CompanyClient;
import com.tajfolio.com.jobms.job.dto.JobWithCompanyDTO;
import com.tajfolio.com.jobms.job.external.Company;
import com.tajfolio.com.jobms.job.messaging.JobEventPublisher;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final CompanyClient companyClient;
    private final JobEventPublisher eventPublisher;

    public JobServiceImpl(JobRepository jobRepository, CompanyClient companyClient,
                          JobEventPublisher eventPublisher) {
        this.jobRepository = jobRepository;
        this.companyClient = companyClient;
        this.eventPublisher = eventPublisher;
    }

    @Override
    public List<JobWithCompanyDTO> findAll() {
        return jobRepository.findAll().stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    @Override
    public List<JobWithCompanyDTO> searchJobs(String keyword, String location,
                                               String jobType, String experienceLevel, String status) {
        // default to OPEN jobs only if no status filter
        String statusFilter = (status != null && !status.isBlank()) ? status : "OPEN";
        return jobRepository.searchJobs(
            keyword != null && keyword.isBlank() ? null : keyword,
            location != null && location.isBlank() ? null : location,
            jobType != null && jobType.isBlank() ? null : jobType,
            experienceLevel != null && experienceLevel.isBlank() ? null : experienceLevel,
            statusFilter
        ).stream().map(this::convertToDto).collect(Collectors.toList());
    }

    private JobWithCompanyDTO convertToDto(Job job) {
        JobWithCompanyDTO dto = new JobWithCompanyDTO();
        dto.setJob(job);
        try {
            Company company = companyClient.getCompanyById(job.getCompanyId());
            dto.setCompany(company);
        } catch (Exception e) {
            Company fallback = new Company();
            fallback.setId(job.getCompanyId());
            fallback.setName("Company");
            dto.setCompany(fallback);
        }
        return dto;
    }

    @Override
    public void createJob(Job job) {
        if (job.getStatus() == null) job.setStatus("OPEN");
        Job saved = jobRepository.save(job);
        try { eventPublisher.publishJobCreated(saved); } catch (Exception ignored) {}
    }

    @Override
    public Job getJobById(Long id) {
        return jobRepository.findById(id).orElse(null);
    }

    @Override
    public boolean deleteJobById(Long id) {
        if (jobRepository.existsById(id)) {
            jobRepository.deleteById(id);
            try { eventPublisher.publishJobDeleted(id); } catch (Exception ignored) {}
            return true;
        }
        return false;
    }

    @Override
    public boolean updateJob(Long id, Job updatedJob) {
        Optional<Job> jobOptional = jobRepository.findById(id);
        if (jobOptional.isPresent()) {
            Job job = jobOptional.get();
            job.setTitle(updatedJob.getTitle());
            job.setDescription(updatedJob.getDescription());
            job.setMinSalary(updatedJob.getMinSalary());
            job.setMaxSalary(updatedJob.getMaxSalary());
            job.setLocation(updatedJob.getLocation());
            if (updatedJob.getRequiredSkills() != null) job.setRequiredSkills(updatedJob.getRequiredSkills());
            if (updatedJob.getJobType() != null) job.setJobType(updatedJob.getJobType());
            if (updatedJob.getExperienceLevel() != null) job.setExperienceLevel(updatedJob.getExperienceLevel());
            if (updatedJob.getClosingDate() != null) job.setClosingDate(updatedJob.getClosingDate());
            Job saved = jobRepository.save(job);
            try { eventPublisher.publishJobUpdated(saved); } catch (Exception ignored) {}
            return true;
        }
        return false;
    }

    @Override
    public boolean closeJob(Long id) {
        return jobRepository.findById(id).map(job -> {
            job.setStatus("CLOSED");
            jobRepository.save(job);
            return true;
        }).orElse(false);
    }

    @Override
    public boolean openJob(Long id) {
        return jobRepository.findById(id).map(job -> {
            job.setStatus("OPEN");
            jobRepository.save(job);
            return true;
        }).orElse(false);
    }

    @Override
    public List<JobWithCompanyDTO> findByCompanyId(Long companyId) {
        return jobRepository.findByCompanyId(companyId).stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }
}
