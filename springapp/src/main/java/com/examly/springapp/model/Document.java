package com.examly.springapp.model;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import javax.persistence.*;
import javax.validation.constraints.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;

@Entity
@Table(
    name = "documents",
    indexes = {
        @Index(name = "idx_doc_owner",    columnList = "ownerId"),
        @Index(name = "idx_doc_status",   columnList = "status"),
        @Index(name = "idx_doc_category", columnList = "documentCategory"),
        @Index(name = "idx_doc_deleted",  columnList = "deleted"),
        @Index(name = "idx_doc_checksum", columnList = "checksum", unique = true)
    }
)
@EntityListeners(AuditingEntityListener.class)
public class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false)
    private String fileName;

    @NotBlank
    @Size(max = 255)
    @Column(nullable = false)
    private String originalFileName;

    @NotBlank
    @Size(max = 127)
    @Column(nullable = false, length = 127)
    private String mimeType;

    @Positive
    @Column(nullable = false)
    private Long fileSize;

    @NotBlank
    @Column(nullable = false, length = 1024)
    private String filePath;

    @NotBlank
    @Size(max = 128)
    @Column(nullable = false, length = 128)
    private String checksum;

    @Column(nullable = false, length = 1024)
    private String encryptedContentPath;

    @Size(max = 128)
    @Column(length = 128)
    private String encryptionKeyId;

    @NotNull
    @Column(nullable = false)
    private Long ownerId;
    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private DocumentCategory documentCategory;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private SecurityClassification securityClassification;

    @NotNull
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private DocumentStatus status;

    @Version
    @Column(nullable = false)
    private Integer version;
    @Column(nullable = false)
    private boolean deleted = false;

    @Column(columnDefinition = "TEXT")
    private String extractedText;

    @Column(nullable = false)
    private boolean favorite = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "folder_id")
    private Folder folder;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "document_tags", joinColumns = @JoinColumn(name = "document_id"))
    @Column(name = "tag", length = 100)
    private Set<String> tags = new HashSet<>();

 
    private LocalDate retentionDate;

    private LocalDate archiveDate;

    @CreatedDate
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(nullable = false)
    private LocalDateTime updatedAt;

    @ElementCollection(fetch = FetchType.LAZY)
    @CollectionTable(name = "document_metadata", joinColumns = @JoinColumn(name = "document_id"))
    @MapKeyColumn(name = "meta_key", length = 100)
    @Column(name = "meta_value", length = 500)
    private Map<String, String> metadata = new HashMap<>();
    public Document() {
        this.deleted = false;
        this.metadata = new HashMap<>();
    }

    public Document(Long id, String fileName, String originalFileName, String mimeType,
                    Long fileSize, String filePath, String checksum,
                    String encryptedContentPath, String encryptionKeyId,
                    Long ownerId, DocumentCategory documentCategory,
                    SecurityClassification securityClassification, DocumentStatus status,
                    Integer version, boolean deleted, LocalDate retentionDate,
                    LocalDate archiveDate, LocalDateTime createdAt, LocalDateTime updatedAt,
                    Map<String, String> metadata) {
        this.id = id;
        this.fileName = fileName;
        this.originalFileName = originalFileName;
        this.mimeType = mimeType;
        this.fileSize = fileSize;
        this.filePath = filePath;
        this.checksum = checksum;
        this.encryptedContentPath = encryptedContentPath;
        this.encryptionKeyId = encryptionKeyId;
        this.ownerId = ownerId;
        this.documentCategory = documentCategory;
        this.securityClassification = securityClassification;
        this.status = status;
        this.version = version;
        this.deleted = deleted;
        this.retentionDate = retentionDate;
        this.archiveDate = archiveDate;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.metadata = metadata;
    }


    public Long getId() { return id; }
    public String getFileName() { return fileName; }
    public String getOriginalFileName() { return originalFileName; }
    public String getMimeType() { return mimeType; }
    public Long getFileSize() { return fileSize; }
    public String getFilePath() { return filePath; }
    public String getChecksum() { return checksum; }
    public String getEncryptedContentPath() { return encryptedContentPath; }
    public String getEncryptionKeyId() { return encryptionKeyId; }
    public Long getOwnerId() { return ownerId; }
    public DocumentCategory getDocumentCategory() { return documentCategory; }
    public SecurityClassification getSecurityClassification() { return securityClassification; }
    public DocumentStatus getStatus() { return status; }
    public Integer getVersion() { return version; }
    public boolean isDeleted() { return deleted; }
    public LocalDate getRetentionDate() { return retentionDate; }
    public LocalDate getArchiveDate() { return archiveDate; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public Map<String, String> getMetadata() { return metadata; }

   
    public void setId(Long id) { this.id = id; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public void setFilePath(String filePath) { this.filePath = filePath; }
    public void setChecksum(String checksum) { this.checksum = checksum; }
    public void setEncryptedContentPath(String encryptedContentPath) { this.encryptedContentPath = encryptedContentPath; }
    public void setEncryptionKeyId(String encryptionKeyId) { this.encryptionKeyId = encryptionKeyId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    public void setDocumentCategory(DocumentCategory documentCategory) { this.documentCategory = documentCategory; }
    public void setSecurityClassification(SecurityClassification securityClassification) { this.securityClassification = securityClassification; }
    public void setStatus(DocumentStatus status) { this.status = status; }
    public void setVersion(Integer version) { this.version = version; }
    public void setDeleted(boolean deleted) { this.deleted = deleted; }
    public void setRetentionDate(LocalDate retentionDate) { this.retentionDate = retentionDate; }
    public void setArchiveDate(LocalDate archiveDate) { this.archiveDate = archiveDate; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public void setMetadata(Map<String, String> metadata) { this.metadata = metadata; }

    public String getExtractedText() { return extractedText; }
    public void setExtractedText(String extractedText) { this.extractedText = extractedText; }
    public boolean isFavorite() { return favorite; }
    public void setFavorite(boolean favorite) { this.favorite = favorite; }
    public Folder getFolder() { return folder; }
    public void setFolder(Folder folder) { this.folder = folder; }
    public Set<String> getTags() { return tags; }
    public void setTags(Set<String> tags) { this.tags = tags; }

    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private Long id;
        private String fileName;
        private String originalFileName;
        private String mimeType;
        private Long fileSize;
        private String filePath;
        private String checksum;
        private String encryptedContentPath;
        private String encryptionKeyId;
        private Long ownerId;
        private DocumentCategory documentCategory;
        private SecurityClassification securityClassification;
        private DocumentStatus status;
        private Integer version;
        private boolean deleted = false;
        private LocalDate retentionDate;
        private LocalDate archiveDate;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Map<String, String> metadata = new HashMap<>();

        public Builder id(Long id) { this.id = id; return this; }
        public Builder fileName(String fileName) { this.fileName = fileName; return this; }
        public Builder originalFileName(String originalFileName) { this.originalFileName = originalFileName; return this; }
        public Builder mimeType(String mimeType) { this.mimeType = mimeType; return this; }
        public Builder fileSize(Long fileSize) { this.fileSize = fileSize; return this; }
        public Builder filePath(String filePath) { this.filePath = filePath; return this; }
        public Builder checksum(String checksum) { this.checksum = checksum; return this; }
        public Builder encryptedContentPath(String encryptedContentPath) { this.encryptedContentPath = encryptedContentPath; return this; }
        public Builder encryptionKeyId(String encryptionKeyId) { this.encryptionKeyId = encryptionKeyId; return this; }
        public Builder ownerId(Long ownerId) { this.ownerId = ownerId; return this; }
        public Builder documentCategory(DocumentCategory documentCategory) { this.documentCategory = documentCategory; return this; }
        public Builder securityClassification(SecurityClassification securityClassification) { this.securityClassification = securityClassification; return this; }
        public Builder status(DocumentStatus status) { this.status = status; return this; }
        public Builder version(Integer version) { this.version = version; return this; }
        public Builder deleted(boolean deleted) { this.deleted = deleted; return this; }
        public Builder retentionDate(LocalDate retentionDate) { this.retentionDate = retentionDate; return this; }
        public Builder archiveDate(LocalDate archiveDate) { this.archiveDate = archiveDate; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder updatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; return this; }
        public Builder metadata(Map<String, String> metadata) { this.metadata = metadata; return this; }

        public Document build() {
            Document doc = new Document();
            doc.id = this.id;
            doc.fileName = this.fileName;
            doc.originalFileName = this.originalFileName;
            doc.mimeType = this.mimeType;
            doc.fileSize = this.fileSize;
            doc.filePath = this.filePath;
            doc.checksum = this.checksum;
            doc.encryptedContentPath = this.encryptedContentPath;
            doc.encryptionKeyId = this.encryptionKeyId;
            doc.ownerId = this.ownerId;
            doc.documentCategory = this.documentCategory;
            doc.securityClassification = this.securityClassification;
            doc.status = this.status;
            doc.version = this.version;
            doc.deleted = this.deleted;
            doc.retentionDate = this.retentionDate;
            doc.archiveDate = this.archiveDate;
            doc.createdAt = this.createdAt;
            doc.updatedAt = this.updatedAt;
            doc.metadata = this.metadata;
            return doc;
        }
    }

   
    public enum DocumentStatus {
        DRAFT, ACTIVE, ARCHIVED, PENDING_REVIEW, EXPIRED, DELETED
    }

    public enum DocumentCategory {
        CONTRACT, INVOICE, REPORT, POLICY, LEGAL, FINANCIAL, HR, TECHNICAL, OTHER
    }

    public enum SecurityClassification {
        PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED, TOP_SECRET
    }
}
