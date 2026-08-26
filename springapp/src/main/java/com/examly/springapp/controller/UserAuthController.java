package com.examly.springapp.controller;

import com.examly.springapp.dto.LoginRequest;
import com.examly.springapp.dto.LoginResponse;
import com.examly.springapp.dto.RegisterRequest;
import com.examly.springapp.dto.UserProfileResponse;
import com.examly.springapp.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;

@RestController
@RequestMapping("/api")
@Validated
@Tag(name = "Authentication", description = "User & Admin registration, login, logout, and profile management")
public class UserAuthController {

    private final UserService userService;

    public UserAuthController(UserService userService) {
        this.userService = userService;
    }

    // ─── User Registration ───────────────────────────────────────────────────

    @PostMapping("/users/register")
    @Operation(
        summary = "Register new user",
        description = "Register a new user account. Password must be at least 8 characters. " +
                      "Username must be 3–50 characters. Email must be valid."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "User registered successfully"),
        @ApiResponse(responseCode = "400", description = "Validation failed (e.g. password less than 8 characters, invalid email)"),
        @ApiResponse(responseCode = "409", description = "Username or email already exists")
    })
    public ResponseEntity<UserProfileResponse> register(@Valid @RequestBody RegisterRequest request) {
        UserProfileResponse response = userService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ─── User Login ──────────────────────────────────────────────────────────

    @PostMapping("/auth/login")
    @Operation(
        summary = "User login",
        description = "Authenticate a regular user. Admin accounts cannot use this endpoint — use /api/admin/login instead."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Login successful — returns JWT token and user profile"),
        @ApiResponse(responseCode = "400", description = "Invalid username or password"),
        @ApiResponse(responseCode = "403", description = "Account locked or inactive"),
        @ApiResponse(responseCode = "401", description = "Admin accounts must use the admin login portal")
    })
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = userService.login(request);
        return ResponseEntity.ok(response);
    }

    // ─── Admin Login ─────────────────────────────────────────────────────────

    @PostMapping("/admin/login")
    @Operation(
        summary = "Admin login",
        description = "Authenticate an administrator. Only accounts with ADMIN role can log in here. " +
                      "Non-admin accounts will receive a 403 Forbidden response."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Admin login successful — returns JWT token and admin profile"),
        @ApiResponse(responseCode = "400", description = "Invalid admin credentials"),
        @ApiResponse(responseCode = "403", description = "Access denied — not an admin account"),
        @ApiResponse(responseCode = "423", description = "Admin account is temporarily locked")
    })
    public ResponseEntity<LoginResponse> adminLogin(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = userService.adminLogin(request);
        return ResponseEntity.ok(response);
    }

    // ─── Logout ──────────────────────────────────────────────────────────────

    @PostMapping("/auth/logout")
    @Operation(
        summary = "Logout",
        description = "Invalidate the session or JWT token. Client should discard the token after this call."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Successfully logged out")
    })
    public ResponseEntity<Void> logout(@RequestHeader(value = "Authorization", required = false) String authHeader) {
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            userService.logout(authHeader.substring(7));
        }
        return ResponseEntity.ok().build();
    }

    // ─── Profile ─────────────────────────────────────────────────────────────

    @GetMapping("/users/profile")
    @Operation(
        summary = "Get user profile",
        description = "Fetch the profile information for the given user ID."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile retrieved successfully"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<UserProfileResponse> getProfile(@RequestParam Long userId) {
        UserProfileResponse response = userService.getProfile(userId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/users/profile")
    @Operation(
        summary = "Update user profile",
        description = "Update user account details such as username, email, password, and role."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Profile updated successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request payload"),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<UserProfileResponse> updateProfile(
            @RequestParam Long userId,
            @Valid @RequestBody RegisterRequest request) {
        UserProfileResponse response = userService.updateProfile(userId, request);
        return ResponseEntity.ok(response);
    }
}
