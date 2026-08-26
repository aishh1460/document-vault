package com.examly.springapp.dto;

import com.examly.springapp.model.Document;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Set;

public class DocumentResponse {

    private Long id;
    private String fileName;
    private String originalFileName;
    private String mimeType;
    private Long fileSize;
    private Long ownerId;
    private String documentCategory;
    private String securityClassification;
    private String status;
    private Integer version;
    private String checksum;
    private String encryptionKeyId;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Map<String, String> metadata;
    private String extractedText;
    private boolean favorite;
    private Long folderId;
    private Set<String> tags;

    public DocumentResponse() {}

    public static DocumentResponse from(Document doc) {
        DocumentResponse dto = new DocumentResponse();
        dto.setId(doc.getId());
        dto.setFileName(doc.getFileName());
        dto.setOriginalFileName(doc.getOriginalFileName());
        dto.setMimeType(doc.getMimeType());
        dto.setFileSize(doc.getFileSize());
        dto.setOwnerId(doc.getOwnerId());
        dto.setDocumentCategory(doc.getDocumentCategory() != null ? doc.getDocumentCategory().name() : null);
        dto.setSecurityClassification(doc.getSecurityClassification() != null ? doc.getSecurityClassification().name() : null);
        dto.setStatus(doc.getStatus() != null ? doc.getStatus().name() : null);
        dto.setVersion(doc.getVersion());
        dto.setChecksum(doc.getChecksum());
        dto.setEncryptionKeyId(doc.getEncryptionKeyId());
        dto.setCreatedAt(doc.getCreatedAt());
        dto.setUpdatedAt(doc.getUpdatedAt());
        dto.setMetadata(doc.getMetadata());
        dto.setExtractedText(doc.getExtractedText());
        dto.setFavorite(doc.isFavorite());
        dto.setFolderId(doc.getFolder() != null ? doc.getFolder().getId() : null);
        dto.setTags(doc.getTags());
        return dto;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public String getFileName() { return fileName; }
    public void setFileName(String fileName) { this.fileName = fileName; }
    public String getOriginalFileName() { return originalFileName; }
    public void setOriginalFileName(String originalFileName) { this.originalFileName = originalFileName; }
    public String getMimeType() { return mimeType; }
    public void setMimeType(String mimeType) { this.mimeType = mimeType; }
    public Long getFileSize() { return fileSize; }
    public void setFileSize(Long fileSize) { this.fileSize = fileSize; }
    public Long getOwnerId() { return ownerId; }
    public void setOwnerId(Long ownerId) { this.ownerId = ownerId; }
    public String getDocumentCategory() { return documentCategory; }
    public void setDocumentCategory(String documentCategory) { this.documentCategory = documentCategory; }
    public String getSecurityClassification() { return securityClassification; }
    public void setSecurityClassification(String securityClassification) { this.securityClassification = securityClassification; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
    public String getChecksum() { return checksum; }
    public void setChecksum(String checksum) { this.checksum = checksum; }
    public String getEncryptionKeyId() { return encryptionKeyId; }
    public void setEncryptionKeyId(String encryptionKeyId) { this.encryptionKeyId = encryptionKeyId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    public Map<String, String> getMetadata() { return metadata; }
    public void setMetadata(Map<String, String> metadata) { this.metadata = metadata; }
    public String getExtractedText() { return extractedText; }
    public void setExtractedText(String extractedText) { this.extractedText = extractedText; }
    public boolean isFavorite() { return favorite; }
    public void setFavorite(boolean favorite) { this.favorite = favorite; }
    public Long getFolderId() { return folderId; }
    public void setFolderId(Long folderId) { this.folderId = folderId; }
    public Set<String> getTags() { return tags; }
    public void setTags(Set<String> tags) { this.tags = tags; }
}
