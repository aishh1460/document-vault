package com.examly.springapp.dto;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import java.time.LocalDateTime;

public class ShareRequest {

    @NotNull
    @Positive
    private Long documentId;

    private Integer expiryDays; // null = never expires

    private Integer maxAccess = -1; // -1 = unlimited

    private String permissions = "VIEW"; // "VIEW" or "DOWNLOAD" or "EDIT"

    public ShareRequest() {}

    public ShareRequest(Long documentId, Integer expiryDays, Integer maxAccess, String permissions) {
        this.documentId = documentId;
        this.expiryDays = expiryDays;
        this.maxAccess = maxAccess != null ? maxAccess : -1;
        this.permissions = permissions != null ? permissions : "VIEW";
    }

    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }

    public Integer getExpiryDays() { return expiryDays; }
    public void setExpiryDays(Integer expiryDays) { this.expiryDays = expiryDays; }

    public Integer getMaxAccess() { return maxAccess; }
    public void setMaxAccess(Integer maxAccess) { this.maxAccess = maxAccess; }

    public String getPermissions() { return permissions; }
    public void setPermissions(String permissions) { this.permissions = permissions; }
}
