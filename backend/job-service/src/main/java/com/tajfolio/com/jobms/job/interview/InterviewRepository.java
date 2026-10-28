package com.tajfolio.com.jobms.job.interview;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByApplicationId(Long applicationId);
    List<Interview> findByCandidateEmail(String candidateEmail);
    List<Interview> findByRecruiterId(Long recruiterId);
    List<Interview> findByJobId(Long jobId);
    List<Interview> findByStatus(String status);
}
