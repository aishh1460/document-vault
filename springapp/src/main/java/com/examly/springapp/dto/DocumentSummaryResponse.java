package com.examly.springapp.dto;

import com.examly.springapp.model.Document;
import java.time.LocalDateTime;
import java.util.Set;

public class DocumentSummaryResponse {
    private Long id;
    private String fileName;
    private String originalFileName;
    private String mimeType;
    private Long fileSize;
    private Long ownerId;
    private String status;
    private String documentCategory;
    private String securityClassification;
    private LocalDateTime createdAt;
    private String extractedText;
    private boolean favorite;
    private Long folderId;
    private Integer version;
    private Set<String> tags;

    public DocumentSummaryResponse() {}

    public static DocumentSummaryResponse from(Document doc) {
        DocumentSummaryResponse dto = new DocumentSummaryResponse();
        dto.setId(doc.getId());
        dto.setFileName(doc.getFileName());
        dto.setOriginalFileName(doc.getOriginalFileName());
        dto.setMimeType(doc.getMimeType());
        dto.setFileSize(doc.getFileSize());
        dto.setOwnerId(doc.getOwnerId());
        dto.setStatus(doc.getStatus() != null ? doc.getStatus().name() : null);
        dto.setDocumentCategory(doc.getDocumentCategory() != null ? doc.getDocumentCategory().name() : null);
        dto.setSecurityClassification(doc.getSecurityClassification() != null ? doc.getSecurityClassification().name() : null);
        dto.setCreatedAt(doc.getCreatedAt());
        dto.setExtractedText(doc.getExtractedText());
        dto.setFavorite(doc.isFavorite());
        dto.setFolderId(doc.getFolder() != null ? doc.getFolder().getId() : null);
        dto.setVersion(doc.getVersion());
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
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public String getDocumentCategory() { return documentCategory; }
    public void setDocumentCategory(String documentCategory) { this.documentCategory = documentCategory; }
    public String getSecurityClassification() { return securityClassification; }
    public void setSecurityClassification(String securityClassification) { this.securityClassification = securityClassification; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getExtractedText() { return extractedText; }
    public void setExtractedText(String extractedText) { this.extractedText = extractedText; }
    public boolean isFavorite() { return favorite; }
    public void setFavorite(boolean favorite) { this.favorite = favorite; }
    public Long getFolderId() { return folderId; }
    public void setFolderId(Long folderId) { this.folderId = folderId; }
    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }
    public Set<String> getTags() { return tags; }
    public void setTags(Set<String> tags) { this.tags = tags; }
}
