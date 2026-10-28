package com.tajfolio.auth.dto;

import com.tajfolio.auth.model.Role;
import com.tajfolio.auth.model.User;
import com.tajfolio.auth.model.UserStatus;

import java.time.LocalDateTime;

/**
 * Safe user representation — never exposes the password hash.
 */
public class UserDTO {

    private Long id;
    private String email;
    private String name;
    private String phone;
    private Role role;
    private UserStatus status;
    private String requestedRole;
    private Long companyId;
    private String companyName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public UserDTO() {}

    public static UserDTO from(User user) {
        UserDTO dto = new UserDTO();
        dto.id           = user.getId();
        dto.email        = user.getEmail();
        dto.name         = user.getName();
        dto.phone        = user.getPhone();
        dto.role         = user.getRole();
        dto.status       = user.getStatus();
        dto.requestedRole = user.getRequestedRole();
        dto.companyId    = user.getCompanyId();
        dto.companyName  = user.getCompanyName();
        dto.createdAt    = user.getCreatedAt();
        dto.updatedAt    = user.getUpdatedAt();
        return dto;
    }

    public Long getId() { return id; }
    public String getEmail() { return email; }
    public String getName() { return name; }
    public String getPhone() { return phone; }
    public Role getRole() { return role; }
    public UserStatus getStatus() { return status; }
    public String getRequestedRole() { return requestedRole; }
    public Long getCompanyId() { return companyId; }
    public String getCompanyName() { return companyName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
}
