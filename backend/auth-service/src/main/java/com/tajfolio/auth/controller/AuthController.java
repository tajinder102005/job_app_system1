package com.tajfolio.auth.controller;

import com.tajfolio.auth.dto.AuthResponse;
import com.tajfolio.auth.dto.LoginRequest;
import com.tajfolio.auth.dto.RegisterRequest;
import com.tajfolio.auth.dto.UserDTO;
import com.tajfolio.auth.model.User;
import com.tajfolio.auth.repository.UserRepository;
import com.tajfolio.auth.service.AuthService;
import com.tajfolio.auth.util.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/auth")
@CrossOrigin(origins = "*")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public AuthController(AuthService authService, JwtUtil jwtUtil, UserRepository userRepository) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse response = authService.register(request);
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException e) {
            if (e.getMessage().contains("already registered")) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of("message", e.getMessage()));
            }
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse response = authService.login(request);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", e.getMessage()));
        }
    }

    /** Called by API Gateway to validate a token and extract claims */
    @GetMapping("/validate")
    public ResponseEntity<Map<String, Object>> validate(
            @RequestHeader("Authorization") String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("valid", false, "message", "Missing token"));
        }

        String token = authHeader.substring(7);

        if (!authService.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("valid", false, "message", "Invalid or expired token"));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("valid", true);
        response.put("email", authService.extractEmail(token));
        response.put("role",  authService.extractRole(token));
        response.put("userId", jwtUtil.extractClaims(token).get("userId"));
        return ResponseEntity.ok(response);
    }

    /** Returns full profile of the currently authenticated user */
    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(
            @RequestHeader("Authorization") String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Missing token"));
        }

        String token = authHeader.substring(7);

        if (!authService.validateToken(token)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid or expired token"));
        }

        String email = authService.extractEmail(token);
        return userRepository.findByEmail(email)
            .map(user -> ResponseEntity.ok(UserDTO.from(user)))
            .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
    }

    /** Refresh token — issues a new token from an existing valid one */
    @PostMapping("/refresh")
    public ResponseEntity<?> refreshToken(
            @RequestHeader("Authorization") String authHeader) {

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Missing token"));
        }

        String token = authHeader.substring(7);

        try {
            // Allow refresh even if token is slightly expired (within 7 days)
            String email = jwtUtil.extractEmail(token);
            return userRepository.findByEmail(email).map(user -> {
                String newToken = jwtUtil.generateToken(user.getId(), user.getEmail(), user.getRole().name());
                return ResponseEntity.ok(Map.of(
                    "token", newToken,
                    "role", user.getRole().name(),
                    "userId", user.getId(),
                    "name", user.getName() != null ? user.getName() : "",
                    "status", user.getStatus().name()
                ));
            }).orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).build());
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(Map.of("message", "Invalid token"));
        }
    }
}
