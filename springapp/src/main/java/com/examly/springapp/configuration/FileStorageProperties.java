package com.examly.springapp.configuration;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;


@Component
@ConfigurationProperties(prefix = "vault.storage")
public class FileStorageProperties {

    private String location;

    private String uploadDir = "/var/vault/documents";

    private String tempDir = "/var/vault/temp";

   
    private String backupDir = "/var/vault/backup";

    private String versionDir = "/var/vault/versions";
    private String ocrDir = "/var/vault/ocr";
    private String previewDir = "/var/vault/preview";
    private String auditDir = "/var/vault/audit";
    private long maxFileSize = 104_857_600L;
    private long maxRequestSize = 110_100_480L;
    private List<String> allowedFileTypes = List.of(
            "pdf", "doc", "docx", "xls", "xlsx",
            "jpg", "jpeg", "png", "tiff", "txt", "csv"
    );

    private List<String> allowedMimeTypes = List.of(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "image/jpeg",
            "image/png",
            "image/tiff",
            "text/plain",
            "text/csv"
    );

    private boolean encryptionEnabled = true;
    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public String getUploadDir() { return uploadDir; }
    public void setUploadDir(String uploadDir) { this.uploadDir = uploadDir; }

    public String getTempDir() { return tempDir; }
    public void setTempDir(String tempDir) { this.tempDir = tempDir; }

    public String getBackupDir() { return backupDir; }
    public void setBackupDir(String backupDir) { this.backupDir = backupDir; }

    public String getVersionDir() { return versionDir; }
    public void setVersionDir(String versionDir) { this.versionDir = versionDir; }

    public String getOcrDir() { return ocrDir; }
    public void setOcrDir(String ocrDir) { this.ocrDir = ocrDir; }

    public String getPreviewDir() { return previewDir; }
    public void setPreviewDir(String previewDir) { this.previewDir = previewDir; }

    public String getAuditDir() { return auditDir; }
    public void setAuditDir(String auditDir) { this.auditDir = auditDir; }

    public long getMaxFileSize() { return maxFileSize; }
    public void setMaxFileSize(long maxFileSize) { this.maxFileSize = maxFileSize; }

    public long getMaxRequestSize() { return maxRequestSize; }
    public void setMaxRequestSize(long maxRequestSize) { this.maxRequestSize = maxRequestSize; }

    public List<String> getAllowedFileTypes() { return allowedFileTypes; }
    public void setAllowedFileTypes(List<String> allowedFileTypes) { this.allowedFileTypes = allowedFileTypes; }

    public List<String> getAllowedMimeTypes() { return allowedMimeTypes; }
    public void setAllowedMimeTypes(List<String> allowedMimeTypes) { this.allowedMimeTypes = allowedMimeTypes; }

    public boolean isEncryptionEnabled() { return encryptionEnabled; }
    public void setEncryptionEnabled(boolean encryptionEnabled) { this.encryptionEnabled = encryptionEnabled; }
}
