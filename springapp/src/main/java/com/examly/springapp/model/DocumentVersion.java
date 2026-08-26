package com.examly.springapp.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import java.time.LocalDateTime;

/**
 * Stores each historical version of a Document.
 * Created each time uploadNewVersion is called — before the Document is updated.
 */
@Entity
@Table(name = "document_versions",
       indexes = {
           @Index(name = "idx_dv_document", columnList = "documentId"),
           @Index(name = "idx_dv_version",  columnList = "documentId, versionNumber")
       })
@EntityListeners(AuditingEntityListener.class)
public class DocumentVersion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long documentId;

    /** Sequential version number starting at 1. */
    @Column(nullable = false)
    private Integer versionNumber;

    /** Stored file name (UUID-based, on disk). */
    @Column(nullable = false, length = 512)
    private String fileName;

    /** Original file name as uploaded by the user. */
    @Column(nullable = false, length = 255)
    private String originalFileName;

    @Column(nullable = false)
    private Long fileSize;

    @Column(nullable = false, length = 128)
    private String checksum;

    /** Path to the stored/encrypted file for this version. */
    @Column(nullable = false, length = 1024)
    private String filePath;

    /** Encryption key ID for this version's file. */
    @Column(length = 512)
    private String encryptionKeyId;

    /** Optional description of what changed in this version. */
    @Column(length = 1024)
    private String changeDescription;

    /** User ID that uploaded this version. */
    @Column(nullable = false)
    private Long uploadedBy;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public DocumentVersion() {}

    // Getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }

    public Integer getVersionNumber() { return versionNumber; }
    public void setVersionNumber(Integer versionNumber) { this.versionNumber = versionNumber; }

    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }

    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }

    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }

    public String getChecksum() { return checksum; }
    public void setChecksum(String checksum) { this.checksum = checksum; }

    public String getFilePath() { return filePath; }
    public void setFilePath(String filePath) { this.filePath = filePath; }

    public String getEncryptionKeyId() { return encryptionKeyId; }
    public void setEncryptionKeyId(String encryptionKeyId) { this.encryptionKeyId = encryptionKeyId; }

    public String getChangeDescription() { return changeDescription; }
    public void setChangeDescription(String changeDescription) { this.changeDescription = changeDescription; }

    public Long getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(Long uploadedBy) { this.uploadedBy = uploadedBy; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
