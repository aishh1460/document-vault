package com.examly.springapp.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

public class LoginRequest {

    @NotBlank
    @Size(max = 100)
    private String usernameOrEmail;

    @NotBlank
    @Size(min = 8, max = 128)
    private String password;

    private String mfaToken;

    public LoginRequest() {}

    public LoginRequest(String usernameOrEmail, String password) {
        this.usernameOrEmail = usernameOrEmail;
        this.password = password;
    }

    public String getUsernameOrEmail() { return usernameOrEmail; }
    public void setUsernameOrEmail(String usernameOrEmail) { this.usernameOrEmail = usernameOrEmail; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getMfaToken() { return mfaToken; }
    public void setMfaToken(String mfaToken) { this.mfaToken = mfaToken; }
}
