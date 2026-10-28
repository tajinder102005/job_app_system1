package com.tajfolio.auth.controller;

import com.tajfolio.auth.model.UserProfile;
import com.tajfolio.auth.repository.UserProfileRepository;
import com.tajfolio.auth.util.JwtUtil;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/profile")
@CrossOrigin(origins = "*")
public class ProfileController {

    private final UserProfileRepository profileRepository;
    private final JwtUtil jwtUtil;

    public ProfileController(UserProfileRepository profileRepository, JwtUtil jwtUtil) {
        this.profileRepository = profileRepository;
        this.jwtUtil = jwtUtil;
    }

    @GetMapping
    public ResponseEntity<?> getProfile(@RequestHeader("Authorization") String authHeader) {
        Long userId = extractUserId(authHeader);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

        UserProfile profile = profileRepository.findByUserId(userId)
            .orElseGet(() -> {
                UserProfile p = new UserProfile();
                p.setUserId(userId);
                return p;
            });
        return ResponseEntity.ok(profile);
    }

    @PutMapping
    public ResponseEntity<?> updateProfile(@RequestHeader("Authorization") String authHeader,
                                            @RequestBody UserProfile updated) {
        Long userId = extractUserId(authHeader);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("message", "Unauthorized"));

        UserProfile profile = profileRepository.findByUserId(userId).orElse(new UserProfile());
        profile.setUserId(userId);
        profile.setBio(updated.getBio());
        profile.setLocation(updated.getLocation());
        profile.setSkills(updated.getSkills());
        profile.setEducation(updated.getEducation());
        profile.setExperience(updated.getExperience());
        profile.setResumeUrl(updated.getResumeUrl());
        profile.setLinkedinUrl(updated.getLinkedinUrl());
        profile.setGithubUrl(updated.getGithubUrl());
        profile.setPortfolioUrl(updated.getPortfolioUrl());
        profile.setPhone(updated.getPhone());

        return ResponseEntity.ok(profileRepository.save(profile));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<?> getProfileByUserId(@PathVariable Long userId) {
        return profileRepository.findByUserId(userId)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }

    private Long extractUserId(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) return null;
        try {
            String token = authHeader.substring(7);
            if (!jwtUtil.isTokenValid(token)) return null;
            Object id = jwtUtil.extractClaims(token).get("userId");
            return id != null ? Long.valueOf(id.toString()) : null;
        } catch (Exception e) {
            return null;
        }
    }
}
