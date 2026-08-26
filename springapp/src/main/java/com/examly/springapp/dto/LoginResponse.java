package com.examly.springapp.dto;

public class LoginResponse {
    private String token;
    private String tokenType = "Bearer";
    private Long userId;
    private String username;
    private String role;
    private String email;

    public LoginResponse() {}

    public LoginResponse(String token, Long userId, String username, String role, String email) {
        this.token = token;
        this.userId = userId;
        this.username = username;
        this.role = role;
        this.email = email;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }
    public String getTokenType() { return tokenType; }
    public void setTokenType(String tokenType) { this.tokenType = tokenType; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
}
