package com.examly.springapp.dto;

import com.examly.springapp.model.User;
import java.time.LocalDateTime;


public class UserProfileResponse {
    private Long id;
    private String username;
    private String email;
    private String role;
    private String securityClearance;
    private boolean mfaEnabled;
    private boolean active;
    private LocalDateTime createdDate;
    private LocalDateTime lastLogin;
    private int failedLoginAttempts;

    public UserProfileResponse() {}

    public static UserProfileResponse from(User user) {
        UserProfileResponse dto = new UserProfileResponse();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setEmail(user.getEmail());
        dto.setRole(user.getRole() != null ? user.getRole().name() : null);
        dto.setSecurityClearance(user.getSecurityClearance() != null ? user.getSecurityClearance().name() : null);
        dto.setActive(user.isActive());
        dto.setCreatedDate(user.getCreatedDate());
        dto.setLastLogin(user.getLastLogin());
        dto.setFailedLoginAttempts(user.getFailedLoginAttempts());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getSecurityClearance() { return securityClearance; }
    public void setSecurityClearance(String securityClearance) { this.securityClearance = securityClearance; }
    public boolean isMfaEnabled() { return mfaEnabled; }
    public void setMfaEnabled(boolean mfaEnabled) { this.mfaEnabled = mfaEnabled; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }
    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }
    public int getFailedLoginAttempts() { return failedLoginAttempts; }
    public void setFailedLoginAttempts(int failedLoginAttempts) { this.failedLoginAttempts = failedLoginAttempts; }
}
