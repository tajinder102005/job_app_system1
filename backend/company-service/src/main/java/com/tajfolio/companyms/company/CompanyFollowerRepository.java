package com.tajfolio.companyms.company;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface CompanyFollowerRepository extends JpaRepository<CompanyFollower, Long> {
    List<CompanyFollower> findByCompanyId(Long companyId);
    List<CompanyFollower> findByUserId(Long userId);
    Optional<CompanyFollower> findByUserIdAndCompanyId(Long userId, Long companyId);
    boolean existsByUserIdAndCompanyId(Long userId, Long companyId);
    void deleteByUserIdAndCompanyId(Long userId, Long companyId);
    long countByCompanyId(Long companyId);
}
