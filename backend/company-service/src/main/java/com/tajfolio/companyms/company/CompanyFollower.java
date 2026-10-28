package com.tajfolio.companyms.company;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "company_followers", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"user_id", "company_id"})
})
public class CompanyFollower {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "company_id", nullable = false)
    private Long companyId;

    private LocalDateTime followedAt = LocalDateTime.now();

    public CompanyFollower() {}
    public CompanyFollower(Long userId, Long companyId) {
        this.userId = userId;
        this.companyId = companyId;
    }

    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }
    public LocalDateTime getFollowedAt() { return followedAt; }
}
