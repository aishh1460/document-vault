package com.examly.springapp.service.impl;

import com.examly.springapp.dto.LoginRequest;
import com.examly.springapp.dto.LoginResponse;
import com.examly.springapp.dto.RegisterRequest;
import com.examly.springapp.dto.UserProfileResponse;
import com.examly.springapp.model.User;
import com.examly.springapp.model.User.UserRole;
import com.examly.springapp.model.User.SecurityClearance;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.NoSuchElementException;
import java.util.UUID;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public UserProfileResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("Username already exists");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.valueOf(request.getRole().toUpperCase()));
        user.setSecurityClearance(SecurityClearance.valueOf(request.getSecurityClearance().toUpperCase()));
        user.setCreatedDate(LocalDateTime.now());
        user.setActive(true);

        User saved = userRepository.save(user);
        return UserProfileResponse.from(saved);
    }

    @Override
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsernameOrEmail())
                .or(() -> userRepository.findByEmail(request.getUsernameOrEmail()))
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password"));

        if (!user.isActive()) {
            throw new IllegalStateException("User account is inactive");
        }

        if (user.getAccountLockedUntil() != null && user.getAccountLockedUntil().isAfter(LocalDateTime.now())) {
            throw new IllegalStateException("Account is temporarily locked. Please try again later.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
            if (user.getFailedLoginAttempts() >= 5) {
                user.setAccountLockedUntil(LocalDateTime.now().plusMinutes(15));
            }
            userRepository.save(user);
            throw new IllegalArgumentException("Invalid username or password");
        }

        // Users should NOT login via admin endpoint
        if (user.getRole() == UserRole.ADMIN) {
            throw new IllegalArgumentException("Admin accounts must use the admin login portal");
        }

        user.setFailedLoginAttempts(0);
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        String token = UUID.randomUUID().toString();
        return new LoginResponse(token, user.getId(), user.getUsername(), user.getRole().name(), user.getEmail());
    }

    @Override
    public LoginResponse adminLogin(LoginRequest request) {
        User user = userRepository.findByUsername(request.getUsernameOrEmail())
                .or(() -> userRepository.findByEmail(request.getUsernameOrEmail()))
                .orElseThrow(() -> new IllegalArgumentException("Invalid admin credentials"));

        if (!user.isActive()) {
            throw new IllegalStateException("Admin account is inactive");
        }

        if (user.getAccountLockedUntil() != null && user.getAccountLockedUntil().isAfter(LocalDateTime.now())) {
            throw new IllegalStateException("Admin account is temporarily locked. Please try again later.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            user.setFailedLoginAttempts(user.getFailedLoginAttempts() + 1);
            if (user.getFailedLoginAttempts() >= 5) {
                user.setAccountLockedUntil(LocalDateTime.now().plusMinutes(15));
            }
            userRepository.save(user);
            throw new IllegalArgumentException("Invalid admin credentials");
        }

        // Only ADMIN role should use this endpoint
        if (user.getRole() != UserRole.ADMIN) {
            throw new IllegalArgumentException("Access denied. This endpoint is reserved for administrators only.");
        }

        user.setFailedLoginAttempts(0);
        user.setLastLogin(LocalDateTime.now());
        userRepository.save(user);
        String token = UUID.randomUUID().toString();
        return new LoginResponse(token, user.getId(), user.getUsername(), user.getRole().name(), user.getEmail());
    }

    @Override
    public void logout(String token) {
        // Stateless - token invalidation handled client-side
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));
        return UserProfileResponse.from(user);
    }

    @Override
    public UserProfileResponse updateProfile(Long userId, RegisterRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found"));

        if (request.getUsername() != null) user.setUsername(request.getUsername());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }
        if (request.getRole() != null) {
            user.setRole(UserRole.valueOf(request.getRole().toUpperCase()));
        }
        if (request.getSecurityClearance() != null) {
            user.setSecurityClearance(SecurityClearance.valueOf(request.getSecurityClearance().toUpperCase()));
        }

        User saved = userRepository.save(user);
        return UserProfileResponse.from(saved);
    }
}
