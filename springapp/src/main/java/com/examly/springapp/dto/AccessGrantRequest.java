package com.examly.springapp.dto;

import javax.validation.constraints.NotBlank;
import javax.validation.constraints.NotNull;
import java.time.LocalDateTime;

public class AccessGrantRequest {

    @NotNull
    private Long documentId;
    @NotNull
    private Long userId;
    @NotBlank
    private String permissionLevel;
    @NotBlank
    private String accessType;
    private LocalDateTime expiryDate;
    private String conditions;
    public AccessGrantRequest() {}

    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getPermissionLevel() { return permissionLevel; }
    public void setPermissionLevel(String permissionLevel) { this.permissionLevel = permissionLevel; }
    public String getAccessType() { return accessType; }
    public void setAccessType(String accessType) { this.accessType = accessType; }
    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }
    public String getConditions() { return conditions; }
    public void setConditions(String conditions) { this.conditions = conditions; }
}
