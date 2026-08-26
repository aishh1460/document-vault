package com.examly.springapp.model;

import javax.persistence.*;
import java.time.LocalDateTime;
@Entity
@Table(
    name = "access_controls",
    indexes = {
        @Index(name = "idx_ac_document", columnList = "documentId"),
        @Index(name = "idx_ac_user",     columnList = "userId")
    }
)
public class AccessControl {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long documentId;

    @Column(nullable = false)
    private Long userId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PermissionLevel permissionLevel;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AccessType accessType;

    @Column(nullable = false)
    private Long grantedBy;

    @Column(nullable = false)
    private LocalDateTime grantedDate;

    @Column
    private LocalDateTime expiryDate;

    @Column(columnDefinition = "TEXT")
    private String conditions;

    public AccessControl() {}

    public AccessControl(Long documentId, Long userId, PermissionLevel permissionLevel,
                         AccessType accessType, Long grantedBy, LocalDateTime grantedDate,
                         LocalDateTime expiryDate) {
        this.documentId = documentId;
        this.userId = userId;
        this.permissionLevel = permissionLevel;
        this.accessType = accessType;
        this.grantedBy = grantedBy;
        this.grantedDate = grantedDate;
        this.expiryDate = expiryDate;
    }
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public PermissionLevel getPermissionLevel() { return permissionLevel; }
    public void setPermissionLevel(PermissionLevel permissionLevel) { this.permissionLevel = permissionLevel; }

    public AccessType getAccessType() { return accessType; }
    public void setAccessType(AccessType accessType) { this.accessType = accessType; }

    public Long getGrantedBy() { return grantedBy; }
    public void setGrantedBy(Long grantedBy) { this.grantedBy = grantedBy; }

    public LocalDateTime getGrantedDate() { return grantedDate; }
    public void setGrantedDate(LocalDateTime grantedDate) { this.grantedDate = grantedDate; }

    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }

    public String getConditions() { return conditions; }
    public void setConditions(String conditions) { this.conditions = conditions; }

    public enum PermissionLevel {
        VIEW, COMMENT, EDIT, SHARE, DOWNLOAD, PRINT, ADMIN
    }

    public enum AccessType {
        PERSONAL, TEAM, DEPARTMENT, ORGANIZATION, PUBLIC, TIME_LIMITED
    }
}
