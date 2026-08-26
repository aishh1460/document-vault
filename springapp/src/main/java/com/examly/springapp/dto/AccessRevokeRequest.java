package com.examly.springapp.dto;

import javax.validation.constraints.NotNull;

public class AccessRevokeRequest {

    @NotNull
    private Long documentId;

    @NotNull
    private Long userId;

    public AccessRevokeRequest() {}

    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}
