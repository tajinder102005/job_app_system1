package com.tajfolio.auth.dto;

import com.tajfolio.auth.model.Role;
import com.tajfolio.auth.model.UserStatus;

public class AuthResponse {
    
    private String token;
    private Long userId;
    private String email;
    private String name;
    private Role role;
    private UserStatus status;
    private String message;
    private Long companyId;
    private String companyName;
    
    public AuthResponse() {}
    
    public AuthResponse(String token, Long userId, String email, String name, Role role, UserStatus status) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.name = name;
        this.role = role;
        this.status = status;
    }

    public AuthResponse(String token, Long userId, String email, String name, Role role, UserStatus status, Long companyId, String companyName) {
        this.token = token;
        this.userId = userId;
        this.email = email;
        this.name = name;
        this.role = role;
        this.status = status;
        this.companyId = companyId;
        this.companyName = companyName;
    }
    
    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    
    public UserStatus getStatus() { return status; }
    public void setStatus(UserStatus status) { this.status = status; }
    
    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public Long getCompanyId() { return companyId; }
    public void setCompanyId(Long companyId) { this.companyId = companyId; }

    public String getCompanyName() { return companyName; }
    public void setCompanyName(String companyName) { this.companyName = companyName; }
}
