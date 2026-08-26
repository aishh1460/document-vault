package com.examly.springapp.dto;

import com.examly.springapp.model.ShareLink;
import java.time.LocalDateTime;

public class ShareResponse {

    private Long id;
    private Long documentId;
    private String documentTitle;
    private Long createdBy;
    private String accessToken;
    private String shareUrl;
    private LocalDateTime expiryDate;
    private int accessCount;
    private int maxAccess;
    private String permissions;
    private boolean active;
    private LocalDateTime createdAt;

    public ShareResponse() {}

    public static ShareResponse from(ShareLink link, String documentTitle) {
        ShareResponse res = new ShareResponse();
        res.setId(link.getId());
        res.setDocumentId(link.getDocumentId());
        res.setDocumentTitle(documentTitle);
        res.setCreatedBy(link.getCreatedBy());
        res.setAccessToken(link.getAccessToken());
        res.setExpiryDate(link.getExpiryDate());
        res.setAccessCount(link.getAccessCount());
        res.setMaxAccess(link.getMaxAccess());
        res.setPermissions(link.getPermissions());
        res.setActive(link.isActive());
        res.setCreatedAt(link.getCreatedAt());
        res.setShareUrl("/share/" + link.getAccessToken());
        return res;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }

    public String getDocumentTitle() { return documentTitle; }
    public void setDocumentTitle(String documentTitle) { this.documentTitle = documentTitle; }

    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

    public String getShareUrl() { return shareUrl; }
    public void setShareUrl(String shareUrl) { this.shareUrl = shareUrl; }

    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }

    public int getAccessCount() { return accessCount; }
    public void setAccessCount(int accessCount) { this.accessCount = accessCount; }

    public int getMaxAccess() { return maxAccess; }
    public void setMaxAccess(int maxAccess) { this.maxAccess = maxAccess; }

    public String getPermissions() { return permissions; }
    public void setPermissions(String permissions) { this.permissions = permissions; }

    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
