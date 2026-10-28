package com.tajfolio.auth.config;

import com.tajfolio.auth.model.Role;
import com.tajfolio.auth.model.User;
import com.tajfolio.auth.model.UserStatus;
import com.tajfolio.auth.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Seeds demo accounts on startup if they don't exist yet.
 * Creates Admin, Recruiter, and Candidate demo users for testing.
 */
@Component
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeeder(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        createDemoUsers();
    }

    private void createDemoUsers() {
        // Create Admin user
        if (userRepository.findByEmail("admin@jobflow.com").isEmpty()) {
            User admin = new User();
            admin.setEmail("admin@jobflow.com");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setName("System Administrator");
            admin.setRole(Role.ADMIN);
            admin.setStatus(UserStatus.ACTIVE);
            userRepository.save(admin);
            System.out.println("✅ Demo Admin created: admin@jobflow.com / Admin@123");
        }

        // Create Recruiter user
        if (userRepository.findByEmail("recruiter@jobflow.com").isEmpty()) {
            User recruiter = new User();
            recruiter.setEmail("recruiter@jobflow.com");
            recruiter.setPassword(passwordEncoder.encode("Recruiter@123"));
            recruiter.setName("Demo Recruiter");
            recruiter.setRole(Role.RECRUITER);
            recruiter.setStatus(UserStatus.ACTIVE);
            userRepository.save(recruiter);
            System.out.println("✅ Demo Recruiter created: recruiter@jobflow.com / Recruiter@123");
        }

        // Create Candidate user
        if (userRepository.findByEmail("candidate@jobflow.com").isEmpty()) {
            User candidate = new User();
            candidate.setEmail("candidate@jobflow.com");
            candidate.setPassword(passwordEncoder.encode("Candidate@123"));
            candidate.setName("Demo Candidate");
            candidate.setRole(Role.CANDIDATE);
            candidate.setStatus(UserStatus.ACTIVE);
            userRepository.save(candidate);
            System.out.println("✅ Demo Candidate created: candidate@jobflow.com / Candidate@123");
        }

        System.out.println("==============================================");
        System.out.println("  🎯 Demo users ready for frontend testing!");
        System.out.println("  Admin: admin@jobflow.com / Admin@123");
        System.out.println("  Recruiter: recruiter@jobflow.com / Recruiter@123");
        System.out.println("  Candidate: candidate@jobflow.com / Candidate@123");
        System.out.println("==============================================");
    }
}
