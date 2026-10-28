package com.tajfolio.auth.controller;

import com.tajfolio.auth.dto.UserDTO;
import com.tajfolio.auth.model.UserStatus;
import com.tajfolio.auth.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    /** Platform overview stats */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(adminService.getPlatformStats());
    }

    /** All users — password never returned (UserDTO) */
    @GetMapping("/users")
    public ResponseEntity<List<UserDTO>> getAllUsers() {
        return ResponseEntity.ok(
                adminService.getAllUsers().stream().map(UserDTO::from).collect(Collectors.toList()));
    }

    /** Single user */
    @GetMapping("/users/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(UserDTO.from(adminService.getUserById(userId)));
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    /** Pending recruiter requests */
    @GetMapping("/users/pending-recruiters")
    public ResponseEntity<List<UserDTO>> getPendingRecruiterRequests() {
        return ResponseEntity.ok(
                adminService.getPendingRecruiterRequests().stream().map(UserDTO::from).collect(Collectors.toList()));
    }

    /** Pending admin requests */
    @GetMapping("/users/pending-admins")
    public ResponseEntity<List<UserDTO>> getPendingAdminRequests() {
        return ResponseEntity.ok(
                adminService.getPendingAdminRequests().stream().map(UserDTO::from).collect(Collectors.toList()));
    }

    /** Approve recruiter */
    @PostMapping("/users/{userId}/approve-recruiter")
    public ResponseEntity<?> approveRecruiterRequest(
            @PathVariable Long userId,
            @RequestBody(required = false) Map<String, Object> body) {
        try {
            Long companyId = null;
            String companyName = null;
            if (body != null) {
                if (body.get("companyId") != null) {
                    companyId = Long.valueOf(body.get("companyId").toString());
                }
                if (body.get("companyName") != null) {
                    companyName = (String) body.get("companyName");
                }
            }
            return ResponseEntity.ok(Map.of(
                    "message", "Recruiter approved",
                    "user", UserDTO.from(adminService.approveRecruiterRequest(userId, companyId, companyName))));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** Reject recruiter */
    @PostMapping("/users/{userId}/reject-recruiter")
    public ResponseEntity<?> rejectRecruiterRequest(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(Map.of(
                    "message", "Recruiter request rejected",
                    "user", UserDTO.from(adminService.rejectRecruiterRequest(userId))));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** Promote any user to RECRUITER directly (admin override) */
    @PostMapping("/users/{userId}/promote-recruiter")
    public ResponseEntity<?> promoteToRecruiter(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(Map.of(
                    "message", "User promoted to recruiter",
                    "user", UserDTO.from(adminService.promoteToRecruiter(userId))));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** Promote to ADMIN */
    @PostMapping("/users/{userId}/promote-admin")
    public ResponseEntity<?> promoteToAdmin(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(Map.of(
                    "message", "User promoted to admin",
                    "user", UserDTO.from(adminService.promoteToAdmin(userId))));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** Suspend user */
    @PostMapping("/users/{userId}/suspend")
    public ResponseEntity<?> suspendUser(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(Map.of(
                    "message", "User suspended",
                    "user", UserDTO.from(adminService.suspendUser(userId))));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** Activate user */
    @PostMapping("/users/{userId}/activate")
    public ResponseEntity<?> activateUser(@PathVariable Long userId) {
        try {
            return ResponseEntity.ok(Map.of(
                    "message", "User activated",
                    "user", UserDTO.from(adminService.activateUser(userId))));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** Delete user */
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId) {
        try {
            adminService.deleteUser(userId);
            return ResponseEntity.ok(Map.of("message", "User deleted"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }

    /** Bulk user search by status */
    @GetMapping("/users/status/{status}")
    public ResponseEntity<List<UserDTO>> getUsersByStatus(@PathVariable String status) {
        try {
            UserStatus userStatus = UserStatus.valueOf(status.toUpperCase());
            return ResponseEntity.ok(
                    adminService.getUsersByStatus(userStatus).stream().map(UserDTO::from).collect(Collectors.toList()));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }
}
