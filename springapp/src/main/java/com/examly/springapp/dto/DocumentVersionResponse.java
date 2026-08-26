package com.examly.springapp.dto;

import com.examly.springapp.model.DocumentVersion;
import java.time.LocalDateTime;

public class DocumentVersionResponse {

    private Long id;
    private Long documentId;
    private Integer versionNumber;
    private String originalFileName;
    private Long fileSize;
    private String checksum;
    private String changeDescription;
    private Long uploadedBy;
    private LocalDateTime createdAt;

    public DocumentVersionResponse() {}

    public static DocumentVersionResponse from(DocumentVersion v) {
        DocumentVersionResponse dto = new DocumentVersionResponse();
        dto.setId(v.getId());
        dto.setDocumentId(v.getDocumentId());
        dto.setVersionNumber(v.getVersionNumber());
        dto.setOriginalFileName(v.getOriginalFileName());
        dto.setFileSize(v.getFileSize());
        dto.setChecksum(v.getChecksum());
        dto.setChangeDescription(v.getChangeDescription());
        dto.setUploadedBy(v.getUploadedBy());
        dto.setCreatedAt(v.getCreatedAt());
        return dto;
    }

    // Getters & setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }
    public Integer getVersionNumber() { return versionNumber; }
    public void setVersionNumber(Integer versionNumber) { this.versionNumber = versionNumber; }
    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public String getChecksum() { return checksum; }
    public void setChecksum(String checksum) { this.checksum = checksum; }
    public String getChangeDescription() { return changeDescription; }
    public void setChangeDescription(String changeDescription) { this.changeDescription = changeDescription; }
    public Long getUploadedBy() { return uploadedBy; }
    public void setUploadedBy(Long uploadedBy) { this.uploadedBy = uploadedBy; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
