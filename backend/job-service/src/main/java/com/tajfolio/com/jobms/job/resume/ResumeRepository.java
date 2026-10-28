package com.tajfolio.com.jobms.job.resume;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface ResumeRepository extends JpaRepository<Resume, Long> {
    List<Resume> findByCandidateEmailOrderByVersionDesc(String candidateEmail);

    Optional<Resume> findByCandidateEmailAndVersion(String candidateEmail, Integer version);

    @Query("SELECT COALESCE(MAX(r.version), 0) FROM Resume r WHERE r.candidateEmail = ?1")
    Integer findMaxVersionByCandidateEmail(String candidateEmail);
}
