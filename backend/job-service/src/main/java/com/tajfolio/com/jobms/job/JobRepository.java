package com.tajfolio.com.jobms.job;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface JobRepository extends JpaRepository<Job, Long> {

    List<Job> findByStatus(String status);

    List<Job> findByLocation(String location);

    List<Job> findByJobType(String jobType);

    List<Job> findByExperienceLevel(String experienceLevel);

    List<Job> findByCompanyId(Long companyId);

    @Query("SELECT j FROM Job j WHERE " +
           "(:keyword IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(j.description) LIKE LOWER(CONCAT('%', :keyword, '%')) " +
           "OR LOWER(j.requiredSkills) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
           "AND (:jobType IS NULL OR j.jobType = :jobType) " +
           "AND (:experienceLevel IS NULL OR j.experienceLevel = :experienceLevel) " +
           "AND (:status IS NULL OR j.status = :status)")
    List<Job> searchJobs(
        @Param("keyword") String keyword,
        @Param("location") String location,
        @Param("jobType") String jobType,
        @Param("experienceLevel") String experienceLevel,
        @Param("status") String status
    );
}
