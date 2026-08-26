package com.examly.springapp.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import javax.validation.constraints.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "users",
    indexes = {
        @Index(name = "idx_user_username", columnList = "username", unique = true),
        @Index(name = "idx_user_email",    columnList = "email",    unique = true),
        @Index(name = "idx_user_active",   columnList = "isActive")
    }
)
@EntityListeners(AuditingEntityListener.class)
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 50)
    @Column(nullable = false, unique = true, length = 50)
    private String username;

    @NotBlank
    @Email
    @Size(max = 100)
    @Column(nullable = false, unique = true, length = 100)
    private String email;

    @NotBlank
    @Column(nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private UserRole role = UserRole.VIEWER;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private SecurityClearance securityClearance = SecurityClearance.PUBLIC;


    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdDate;

    @Column
    private LocalDateTime lastLogin;

    @Column(nullable = false)
    private int failedLoginAttempts = 0;

    @Column
    private LocalDateTime accountLockedUntil;

    @Column(nullable = false)
    private boolean isActive = true;

    public User() {}

    public User(String username, String email, String passwordHash, UserRole role,
                SecurityClearance securityClearance) {
        this.username = username;
        this.email = email;
        this.passwordHash = passwordHash;
        this.role = role;
        this.securityClearance = securityClearance;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

    public UserRole getRole() { return role; }
    public void setRole(UserRole role) { this.role = role; }

    public SecurityClearance getSecurityClearance() { return securityClearance; }
    public void setSecurityClearance(SecurityClearance securityClearance) { this.securityClearance = securityClearance; }


    public LocalDateTime getCreatedDate() { return createdDate; }
    public void setCreatedDate(LocalDateTime createdDate) { this.createdDate = createdDate; }

    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }

    public int getFailedLoginAttempts() { return failedLoginAttempts; }
    public void setFailedLoginAttempts(int failedLoginAttempts) { this.failedLoginAttempts = failedLoginAttempts; }

    public LocalDateTime getAccountLockedUntil() { return accountLockedUntil; }
    public void setAccountLockedUntil(LocalDateTime accountLockedUntil) { this.accountLockedUntil = accountLockedUntil; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    
    public enum UserRole {
        VIEWER, COLLABORATOR, MANAGER, ADMINISTRATOR, SECURITY_MANAGER, VAULT_OWNER, AUDITOR, ADMIN
    }

    public enum SecurityClearance {
        PUBLIC, CONFIDENTIAL, SECRET, TOP_SECRET
    }
}
