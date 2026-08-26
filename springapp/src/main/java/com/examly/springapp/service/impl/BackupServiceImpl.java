package com.examly.springapp.service.impl;

import com.examly.springapp.configuration.FileStorageProperties;
import com.examly.springapp.model.Document;
import com.examly.springapp.repository.DocumentRepository;
import com.examly.springapp.service.BackupService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.*;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import java.util.zip.ZipOutputStream;

@Service
public class BackupServiceImpl implements BackupService {

    private static final Logger log = LoggerFactory.getLogger(BackupServiceImpl.class);

    private final DocumentRepository documentRepository;
    private final FileStorageProperties fileStorageProperties;
    private final ObjectMapper objectMapper;
    private LocalDateTime lastBackupTimestamp;

    public BackupServiceImpl(DocumentRepository documentRepository,
                             FileStorageProperties fileStorageProperties,
                             ObjectMapper objectMapper) {
        this.documentRepository = documentRepository;
        this.fileStorageProperties = fileStorageProperties;
        this.objectMapper = objectMapper;
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportBackup(Long requesterId) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream();
             ZipOutputStream zos = new ZipOutputStream(baos)) {

            List<Document> activeDocuments = documentRepository.findAll();

            // 1. Write metadata JSON entry
            Map<String, Object> manifest = new HashMap<>();
            manifest.put("version", "1.0");
            manifest.put("exportedAt", LocalDateTime.now().toString());
            manifest.put("exportedBy", requesterId);
            manifest.put("documentCount", activeDocuments.size());

            List<Map<String, Object>> docRecords = new ArrayList<>();
            for (Document doc : activeDocuments) {
                Map<String, Object> rec = new HashMap<>();
                rec.put("id", doc.getId());
                rec.put("fileName", doc.getFileName());
                rec.put("originalFileName", doc.getOriginalFileName());
                rec.put("mimeType", doc.getMimeType());
                rec.put("fileSize", doc.getFileSize());
                rec.put("checksum", doc.getChecksum());
                rec.put("ownerId", doc.getOwnerId());
                rec.put("documentCategory", doc.getDocumentCategory() != null ? doc.getDocumentCategory().name() : "OTHER");
                rec.put("securityClassification", doc.getSecurityClassification() != null ? doc.getSecurityClassification().name() : "PUBLIC");
                rec.put("status", doc.getStatus() != null ? doc.getStatus().name() : "ACTIVE");
                rec.put("version", doc.getVersion());
                rec.put("deleted", doc.isDeleted());
                rec.put("extractedText", doc.getExtractedText());
                rec.put("encryptionKeyId", doc.getEncryptionKeyId());
                rec.put("tags", doc.getTags());
                docRecords.add(rec);

                // Add physical file if exists
                if (doc.getFilePath() != null) {
                    Path filePath = Paths.get(doc.getFilePath());
                    if (Files.exists(filePath)) {
                        ZipEntry fileEntry = new ZipEntry("files/" + doc.getFileName());
                        zos.putNextEntry(fileEntry);
                        Files.copy(filePath, zos);
                        zos.closeEntry();
                    }
                }
            }
            manifest.put("documents", docRecords);

            // Put manifest.json
            ZipEntry manifestEntry = new ZipEntry("manifest.json");
            zos.putNextEntry(manifestEntry);
            zos.write(objectMapper.writeValueAsBytes(manifest));
            zos.closeEntry();

            zos.finish();
            this.lastBackupTimestamp = LocalDateTime.now();
            log.info("[BACKUP_EXPORT] Created backup containing {} documents by user={}", activeDocuments.size(), requesterId);
            return baos.toByteArray();
        } catch (Exception e) {
            log.error("[BACKUP_EXPORT] Failed to export backup: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to generate backup: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public Map<String, Object> restoreBackup(MultipartFile file, Long requesterId) {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Backup archive file is empty");
        }

        int restoredDocs = 0;
        try (ZipInputStream zis = new ZipInputStream(file.getInputStream())) {
            ZipEntry entry;
            byte[] manifestBytes = null;
            Map<String, byte[]> fileMap = new HashMap<>();

            while ((entry = zis.getNextEntry()) != null) {
                if ("manifest.json".equals(entry.getName())) {
                    manifestBytes = zis.readAllBytes();
                } else if (entry.getName().startsWith("files/") && !entry.isDirectory()) {
                    String fileName = entry.getName().substring("files/".length());
                    fileMap.put(fileName, zis.readAllBytes());
                }
                zis.closeEntry();
            }

            if (manifestBytes == null) {
                throw new IllegalArgumentException("Invalid backup file: manifest.json missing");
            }

            Map<String, Object> manifest = objectMapper.readValue(manifestBytes, new TypeReference<>() {});
            List<Map<String, Object>> docs = (List<Map<String, Object>>) manifest.get("documents");

            String storageRoot = System.getProperty("vault.storage.root",
                    System.getProperty("java.io.tmpdir") + "/vault/documents");
            Files.createDirectories(Paths.get(storageRoot));

            if (docs != null) {
                for (Map<String, Object> docMap : docs) {
                    String fileName = (String) docMap.get("fileName");
                    String checksum = (String) docMap.get("checksum");

                    if (checksum != null && documentRepository.existsByChecksumAndDeletedFalse(checksum)) {
                        continue; // skip duplicate existing checksum
                    }

                    Document doc = new Document();
                    doc.setFileName(fileName);
                    doc.setOriginalFileName((String) docMap.getOrDefault("originalFileName", fileName));
                    doc.setMimeType((String) docMap.getOrDefault("mimeType", "application/octet-stream"));
                    doc.setFileSize(docMap.get("fileSize") != null ? Long.valueOf(docMap.get("fileSize").toString()) : 0L);
                    doc.setChecksum(checksum != null ? checksum : UUID.randomUUID().toString());
                    doc.setOwnerId(requesterId != null ? requesterId : (docMap.get("ownerId") != null ? Long.valueOf(docMap.get("ownerId").toString()) : 1L));

                    String catStr = (String) docMap.get("documentCategory");
                    if (catStr != null) {
                        try { doc.setDocumentCategory(Document.DocumentCategory.valueOf(catStr)); }
                        catch (Exception ignored) { doc.setDocumentCategory(Document.DocumentCategory.OTHER); }
                    } else {
                        doc.setDocumentCategory(Document.DocumentCategory.OTHER);
                    }

                    String classStr = (String) docMap.get("securityClassification");
                    if (classStr != null) {
                        try { doc.setSecurityClassification(Document.SecurityClassification.valueOf(classStr)); }
                        catch (Exception ignored) { doc.setSecurityClassification(Document.SecurityClassification.PUBLIC); }
                    } else {
                        doc.setSecurityClassification(Document.SecurityClassification.PUBLIC);
                    }

                    doc.setStatus(Document.DocumentStatus.ACTIVE);
                    doc.setExtractedText((String) docMap.get("extractedText"));
                    doc.setEncryptionKeyId((String) docMap.get("encryptionKeyId"));

                    // Save physical file if in zip
                    if (fileName != null && fileMap.containsKey(fileName)) {
                        Path dest = Paths.get(storageRoot, fileName);
                        Files.write(dest, fileMap.get(fileName));
                        doc.setFilePath(dest.toAbsolutePath().toString());
                    } else {
                        doc.setFilePath(Paths.get(storageRoot, fileName != null ? fileName : "restored_" + UUID.randomUUID()).toAbsolutePath().toString());
                    }

                    documentRepository.save(doc);
                    restoredDocs++;
                }
            }

            log.info("[BACKUP_RESTORE] Restored {} documents by user={}", restoredDocs, requesterId);
            return Map.of(
                    "status", "success",
                    "restoredDocumentsCount", restoredDocs,
                    "restoredAt", LocalDateTime.now().toString()
            );
        } catch (Exception e) {
            log.error("[BACKUP_RESTORE] Restore failed: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to restore backup: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getBackupStatus() {
        long count = documentRepository.count();
        return Map.of(
                "totalDocuments", count,
                "backupStorageDir", fileStorageProperties.getBackupDir(),
                "lastBackupTimestamp", lastBackupTimestamp != null ? lastBackupTimestamp.toString() : "Never",
                "systemStatus", "READY"
        );
    }
}
