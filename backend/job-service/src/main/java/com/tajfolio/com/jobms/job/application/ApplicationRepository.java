package com.tajfolio.com.jobms.job.application;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ApplicationRepository extends JpaRepository<Application, Long> {
    List<Application> findByJobId(Long jobId);
    List<Application> findByJobIdIn(List<Long> jobIds);
    List<Application> findByEmail(String email);
    List<Application> findByStatus(String status);
    boolean existsByEmailAndJobId(String email, Long jobId);
}
