package com.tajfolio.auth.service;

import com.tajfolio.auth.dto.AuthResponse;
import com.tajfolio.auth.dto.LoginRequest;
import com.tajfolio.auth.dto.RegisterRequest;
import com.tajfolio.auth.messaging.AuthEventPublisher;
import com.tajfolio.auth.model.Role;
import com.tajfolio.auth.model.User;
import com.tajfolio.auth.model.UserStatus;
import com.tajfolio.auth.repository.UserRepository;
import com.tajfolio.auth.util.JwtUtil;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthEventPublisher eventPublisher;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil, AuthEventPublisher eventPublisher) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.eventPublisher = eventPublisher;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email already registered");
        }

        // Create new user
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setName(request.getName());
        user.setPhone(request.getPhone());

        // Role assignment logic based on requested role
        Role requestedRole = request.getRequestedRole();

        switch (requestedRole) {
            case CANDIDATE:
                user.setRole(Role.CANDIDATE);
                user.setStatus(UserStatus.ACTIVE);
                break;

            case RECRUITER:
                // Recruiter requests need admin approval
                user.setRole(Role.CANDIDATE);
                user.setStatus(UserStatus.RECRUITER_PENDING);
                user.setRequestedRole(Role.RECRUITER.name());
                user.setCompanyName(request.getCompanyName());
                break;

            case ADMIN:
                // Admin requests need existing admin approval
                user.setRole(Role.CANDIDATE);
                user.setStatus(UserStatus.ADMIN_PENDING);
                user.setRequestedRole(Role.ADMIN.name());
                break;

            default:
                user.setRole(Role.CANDIDATE);
                user.setStatus(UserStatus.ACTIVE);
        }

        user = userRepository.save(user);

        // Publish event for notifications (fire-and-forget)
        try {
            if (user.getStatus() == UserStatus.RECRUITER_PENDING) {
                eventPublisher.publishRecruiterPending(user);
            } else {
                eventPublisher.publishUserRegistered(user);
            }
        } catch (Exception ignored) {
            // Don't fail registration if messaging is down
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name(), user.getCompanyId(), user.getCompanyName());

        AuthResponse response = new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole(),
                user.getStatus(),
                user.getCompanyId(),
                user.getCompanyName());

        // Set appropriate message based on status
        if (user.getStatus() == UserStatus.RECRUITER_PENDING) {
            response.setMessage("Registration successful. Your recruiter request is pending admin approval.");
        } else if (user.getStatus() == UserStatus.ADMIN_PENDING) {
            response.setMessage("Registration successful. Your admin request is pending approval.");
        } else {
            response.setMessage("Registration successful");
        }

        return response;
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid email or password");
        }

        // Check if user is suspended
        if (user.getStatus() == UserStatus.SUSPENDED) {
            throw new RuntimeException("Account has been suspended. Please contact support.");
        }

        // Generate JWT token
        String token = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name(), user.getCompanyId(), user.getCompanyName());

        AuthResponse response = new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole(),
                user.getStatus(),
                user.getCompanyId(),
                user.getCompanyName());

        // Set message based on status
        if (user.getStatus() == UserStatus.RECRUITER_PENDING) {
            response.setMessage("Login successful. Your recruiter request is still pending approval.");
        } else if (user.getStatus() == UserStatus.ADMIN_PENDING) {
            response.setMessage("Login successful. Your admin request is still pending approval.");
        } else {
            response.setMessage("Login successful");
        }

        return response;
    }

    public boolean validateToken(String token) {
        return jwtUtil.isTokenValid(token);
    }

    public String extractRole(String token) {
        return jwtUtil.extractRole(token);
    }

    public String extractEmail(String token) {
        return jwtUtil.extractEmail(token);
    }
}
