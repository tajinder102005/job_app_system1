package com.tajfolio.auth.service;

import com.tajfolio.auth.messaging.AuthEventPublisher;
import com.tajfolio.auth.model.Role;
import com.tajfolio.auth.model.User;
import com.tajfolio.auth.model.UserStatus;
import com.tajfolio.auth.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final AuthEventPublisher eventPublisher;

    public AdminService(UserRepository userRepository, AuthEventPublisher eventPublisher) {
        this.userRepository = userRepository;
        this.eventPublisher = eventPublisher;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    }

    public List<User> getPendingRecruiterRequests() {
        return userRepository.findByStatus(UserStatus.RECRUITER_PENDING);
    }

    public List<User> getPendingAdminRequests() {
        return userRepository.findByStatus(UserStatus.ADMIN_PENDING);
    }

    public List<User> getUsersByStatus(UserStatus status) {
        return userRepository.findByStatus(status);
    }

    public Map<String, Object> getPlatformStats() {
        long totalUsers = userRepository.count();
        long candidates = userRepository.findByRole(Role.CANDIDATE).size();
        long recruiters = userRepository.findByRole(Role.RECRUITER).size();
        long admins = userRepository.findByRole(Role.ADMIN).size();
        long pendingRecruiters = userRepository.findByStatus(UserStatus.RECRUITER_PENDING).size();
        long pendingAdmins = userRepository.findByStatus(UserStatus.ADMIN_PENDING).size();
        long suspended = userRepository.findByStatus(UserStatus.SUSPENDED).size();
        long activeUsers = userRepository.findByStatus(UserStatus.ACTIVE).size();

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", totalUsers);
        stats.put("candidates", candidates);
        stats.put("recruiters", recruiters);
        stats.put("admins", admins);
        stats.put("pendingRecruiters", pendingRecruiters);
        stats.put("pendingAdmins", pendingAdmins);
        stats.put("suspended", suspended);
        stats.put("activeUsers", activeUsers);
        return stats;
    }

    @Transactional
    public User approveRecruiterRequest(Long userId) {
        return approveRecruiterRequest(userId, null, null);
    }

    @Transactional
    public User approveRecruiterRequest(Long userId, Long companyId, String companyName) {
        User user = getUserById(userId);

        if (user.getStatus() != UserStatus.RECRUITER_PENDING) {
            throw new RuntimeException("User is not pending recruiter approval");
        }

        user.setRole(Role.RECRUITER);
        user.setStatus(UserStatus.ACTIVE);
        user.setRequestedRole(null);
        if (companyId != null) {
            user.setCompanyId(companyId);
        }
        if (companyName != null) {
            user.setCompanyName(companyName);
        }

        User saved = userRepository.save(user);
        try {
            eventPublisher.publishRecruiterApproved(saved);
        } catch (Exception ignored) {
        }
        return saved;
    }

    @Transactional
    public User rejectRecruiterRequest(Long userId) {
        User user = getUserById(userId);

        if (user.getStatus() != UserStatus.RECRUITER_PENDING) {
            throw new RuntimeException("User is not pending recruiter approval");
        }

        user.setStatus(UserStatus.ACTIVE);
        user.setRequestedRole(null);
        User saved = userRepository.save(user);
        return saved;
    }

    @Transactional
    public User promoteToRecruiter(Long userId) {
        User user = getUserById(userId);

        if (user.getRole() == Role.ADMIN) {
            throw new RuntimeException("Cannot demote an admin to recruiter");
        }

        user.setRole(Role.RECRUITER);
        user.setStatus(UserStatus.ACTIVE);
        user.setRequestedRole(null);

        User saved = userRepository.save(user);
        try {
            eventPublisher.publishRecruiterApproved(saved);
        } catch (Exception ignored) {
        }
        return saved;
    }

    @Transactional
    public User promoteToAdmin(Long userId) {
        User user = getUserById(userId);

        user.setRole(Role.ADMIN);
        user.setStatus(UserStatus.ACTIVE);
        user.setRequestedRole(null);

        return userRepository.save(user);
    }

    @Transactional
    public User suspendUser(Long userId) {
        User user = getUserById(userId);

        if (user.getRole() == Role.ADMIN) {
            throw new RuntimeException("Cannot suspend admin users");
        }

        user.setStatus(UserStatus.SUSPENDED);
        return userRepository.save(user);
    }

    @Transactional
    public User activateUser(Long userId) {
        User user = getUserById(userId);
        user.setStatus(UserStatus.ACTIVE);
        return userRepository.save(user);
    }

    @Transactional
    public void deleteUser(Long userId) {
        User user = getUserById(userId);

        if (user.getRole() == Role.ADMIN) {
            throw new RuntimeException("Cannot delete admin users");
        }

        userRepository.delete(user);
    }
}
