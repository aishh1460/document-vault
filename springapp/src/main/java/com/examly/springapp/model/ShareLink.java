package com.examly.springapp.model;

import javax.persistence.*;
import java.time.LocalDateTime;


@Entity
@Table(
    name = "share_links",
    indexes = {
        @Index(name = "idx_sl_document", columnList = "documentId"),
        @Index(name = "idx_sl_token",    columnList = "accessToken", unique = true),
        @Index(name = "idx_sl_creator",  columnList = "createdBy"),
        @Index(name = "idx_sl_active",   columnList = "active")
    }
)
public class ShareLink {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long documentId;

    @Column(nullable = false)
    private Long createdBy;

    @Column(nullable = false, unique = true, length = 128)
    private String accessToken;

    @Column
    private LocalDateTime expiryDate;

    @Column(nullable = false)
    private int accessCount = 0;

    @Column(nullable = false)
    private int maxAccess = -1;  // -1 = unlimited

    @Column(length = 100)
    private String permissions;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false)
    private LocalDateTime createdAt;

  
    public ShareLink() {}

    public ShareLink(Long documentId, Long createdBy, String accessToken,
                     LocalDateTime expiryDate, int maxAccess, String permissions,
                     LocalDateTime createdAt) {
        this.documentId = documentId;
        this.createdBy = createdBy;
        this.accessToken = accessToken;
        this.expiryDate = expiryDate;
        this.maxAccess = maxAccess;
        this.permissions = permissions;
        this.createdAt = createdAt;
        this.active = true;
        this.accessCount = 0;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }

    public Long getCreatedBy() { return createdBy; }
    public void setCreatedBy(Long createdBy) { this.createdBy = createdBy; }

    public String getAccessToken() { return accessToken; }
    public void setAccessToken(String accessToken) { this.accessToken = accessToken; }

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
