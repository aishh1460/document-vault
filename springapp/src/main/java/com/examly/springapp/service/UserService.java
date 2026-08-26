package com.examly.springapp.service;

import com.examly.springapp.dto.LoginRequest;
import com.examly.springapp.dto.LoginResponse;
import com.examly.springapp.dto.RegisterRequest;
import com.examly.springapp.dto.UserProfileResponse;

public interface UserService {
    UserProfileResponse register(RegisterRequest request);
    LoginResponse login(LoginRequest request);
    LoginResponse adminLogin(LoginRequest request);
    void logout(String token);
    UserProfileResponse getProfile(Long userId);
    UserProfileResponse updateProfile(Long userId, RegisterRequest request);
}
