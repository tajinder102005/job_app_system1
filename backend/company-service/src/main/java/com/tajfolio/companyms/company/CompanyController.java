package com.tajfolio.companyms.company;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/companies")
@CrossOrigin(origins = "*")
public class CompanyController {
    private final CompanyService companyService;

    private final CompanyFollowerRepository followerRepository;

    public CompanyController(CompanyService companyService, CompanyFollowerRepository followerRepository) {
        this.companyService = companyService;
        this.followerRepository = followerRepository;
    }

    @GetMapping
    public ResponseEntity<List<Company>> getAllCompanies() {
        return new ResponseEntity<>(companyService.getAllCompanies(), HttpStatus.OK);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Company> getCompanyById(@PathVariable Long id) {
        Company c = companyService.getCompanyById(id);
        if (c != null)
            return new ResponseEntity<>(c, HttpStatus.OK);
        return new ResponseEntity<>(HttpStatus.NOT_FOUND);
    }

    @PutMapping("/{id}")
    public ResponseEntity<String> updateCompany(@PathVariable Long id, @RequestBody Company company) {
        companyService.updateCompany(company, id);
        return new ResponseEntity<>("company updated successfully ", HttpStatus.OK);
    }

    @PostMapping
    public ResponseEntity<String> addCompany(@RequestBody Company company) {
        companyService.createCompany(company);
        return new ResponseEntity<>("company added successfully", HttpStatus.CREATED);

    }

    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteCompany(@PathVariable Long id) {
        boolean isDeleted = companyService.deleteCompany(id);
        if (isDeleted) {
            return new ResponseEntity<>("company deleted successfully", HttpStatus.OK);
        } else {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<Company> verifyCompany(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(companyService.verifyCompany(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/{id}/unverify")
    public ResponseEntity<Company> unverifyCompany(@PathVariable Long id) {
        try {
            return ResponseEntity.ok(companyService.unverifyCompany(id));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/verified")
    public ResponseEntity<List<Company>> getVerifiedCompanies() {
        List<Company> all = companyService.getAllCompanies();
        List<Company> verified = all.stream()
            .filter(c -> Boolean.TRUE.equals(c.getVerified()))
            .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(verified);
    }

    @PostMapping("/{id}/follow")
    public ResponseEntity<Map<String, Object>> followCompany(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        Long userId = parseUserId(userIdHeader);
        if (followerRepository.existsByUserIdAndCompanyId(userId, id)) {
            return ResponseEntity.ok(Map.of("message", "Already following", "following", true));
        }
        followerRepository.save(new CompanyFollower(userId, id));
        long count = followerRepository.countByCompanyId(id);
        return ResponseEntity.ok(Map.of("message", "Now following", "following", true, "followers", count));
    }

    @DeleteMapping("/{id}/follow")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Map<String, Object>> unfollowCompany(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        Long userId = parseUserId(userIdHeader);
        followerRepository.deleteByUserIdAndCompanyId(userId, id);
        long count = followerRepository.countByCompanyId(id);
        return ResponseEntity.ok(Map.of("message", "Unfollowed", "following", false, "followers", count));
    }

    @DeleteMapping("/{id}/unfollow")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Map<String, Object>> unfollowCompanyAlias(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        Long userId = parseUserId(userIdHeader);
        followerRepository.deleteByUserIdAndCompanyId(userId, id);
        long count = followerRepository.countByCompanyId(id);
        return ResponseEntity.ok(Map.of("message", "Unfollowed", "following", false, "followers", count));
    }

    @GetMapping("/{id}/followers")
    public ResponseEntity<Map<String, Object>> getFollowers(@PathVariable Long id) {
        long count = followerRepository.countByCompanyId(id);
        return ResponseEntity.ok(Map.of("companyId", id, "followers", count));
    }

    @GetMapping("/{id}/followers/count")
    public ResponseEntity<Map<String, Object>> getFollowerCount(@PathVariable Long id) {
        long count = followerRepository.countByCompanyId(id);
        return ResponseEntity.ok(Map.of("companyId", id, "count", count));
    }

    @GetMapping("/following")
    public ResponseEntity<List<Company>> getFollowedCompanies(
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        Long userId = parseUserId(userIdHeader);
        List<CompanyFollower> followed = followerRepository.findByUserId(userId);
        List<Company> companies = followed.stream()
            .map(f -> companyService.getCompanyById(f.getCompanyId()))
            .filter(c -> c != null)
            .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(companies);
    }

    @GetMapping("/{id}/follow/check")
    public ResponseEntity<Map<String, Object>> checkFollowing(
            @PathVariable Long id,
            @RequestHeader(value = "X-User-Id", required = false) String userIdHeader) {
        Long userId = parseUserId(userIdHeader);
        boolean following = followerRepository.existsByUserIdAndCompanyId(userId, id);
        return ResponseEntity.ok(Map.of("following", following));
    }

    private Long parseUserId(String header) {
        if (header == null || header.isBlank() || "null".equals(header)) return 1L;
        try { return Long.parseLong(header); } catch (Exception e) { return 1L; }
    }
}
