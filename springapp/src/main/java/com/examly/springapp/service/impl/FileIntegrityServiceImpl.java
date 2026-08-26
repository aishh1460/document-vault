package com.examly.springapp.service.impl;

import com.examly.springapp.model.Document;
import com.examly.springapp.repository.DocumentRepository;
import com.examly.springapp.service.FileIntegrityService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Phase 38 — File Integrity Service Implementation
 *
 * Recomputes SHA-256 checksums of stored files and compares against
 * the persisted checksum. Logs discrepancies. Runs on a daily schedule.
 */
@Service
@Transactional(readOnly = true)
public class FileIntegrityServiceImpl implements FileIntegrityService {

    private static final Logger log = LoggerFactory.getLogger(FileIntegrityServiceImpl.class);

    private final DocumentRepository documentRepository;

    public FileIntegrityServiceImpl(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    @Override
    public Map<String, Object> verifyDocument(Long documentId) {
        Document doc = documentRepository.findById(documentId)
                .filter(d -> !d.isDeleted())
                .orElseThrow(() -> new NoSuchElementException("Document not found: " + documentId));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("documentId", documentId);
        result.put("storedChecksum", doc.getChecksum());
        result.put("filePath", doc.getFilePath());

        try {
            String computedChecksum = computeSha256(doc.getFilePath());
            result.put("computedChecksum", computedChecksum);
            boolean intact = computedChecksum.equals(doc.getChecksum());
            result.put("integrityStatus", intact ? "INTACT" : "COMPROMISED");
            result.put("verifiedAt", LocalDateTime.now().toString());
            if (!intact) {
                log.warn("[INTEGRITY_VIOLATION] doc={} stored={} computed={}", documentId, doc.getChecksum(), computedChecksum);
            }
        } catch (IOException e) {
            result.put("integrityStatus", "FILE_MISSING");
            result.put("error", e.getMessage());
            log.error("[INTEGRITY_ERROR] doc={} file missing: {}", documentId, e.getMessage());
        } catch (NoSuchAlgorithmException e) {
            result.put("integrityStatus", "ERROR");
            result.put("error", e.getMessage());
        }
        return result;
    }

    @Override
    public Map<String, Object> runIntegrityScan() {
        List<Document> allDocs = documentRepository.findAll().stream()
                .filter(d -> !d.isDeleted()).toList();

        int intact = 0, compromised = 0, missing = 0, error = 0;
        List<Map<String, Object>> violations = new ArrayList<>();

        for (Document doc : allDocs) {
            try {
                String computed = computeSha256(doc.getFilePath());
                if (computed.equals(doc.getChecksum())) {
                    intact++;
                } else {
                    compromised++;
                    violations.add(Map.of(
                            "documentId", doc.getId(),
                            "fileName", doc.getOriginalFileName(),
                            "status", "COMPROMISED"
                    ));
                    log.warn("[SCAN_VIOLATION] doc={} name={}", doc.getId(), doc.getOriginalFileName());
                }
            } catch (IOException e) {
                missing++;
                violations.add(Map.of(
                        "documentId", doc.getId(),
                        "fileName", doc.getOriginalFileName(),
                        "status", "FILE_MISSING"
                ));
            } catch (NoSuchAlgorithmException e) {
                error++;
            }
        }

        Map<String, Object> summary = new LinkedHashMap<>();
        summary.put("totalScanned", allDocs.size());
        summary.put("intact", intact);
        summary.put("compromised", compromised);
        summary.put("fileMissing", missing);
        summary.put("errors", error);
        summary.put("violations", violations);
        summary.put("scanCompletedAt", LocalDateTime.now().toString());
        summary.put("overallStatus", (compromised == 0 && missing == 0) ? "ALL_INTACT" : "VIOLATIONS_FOUND");

        log.info("[INTEGRITY_SCAN] total={} intact={} compromised={} missing={}", allDocs.size(), intact, compromised, missing);
        return summary;
    }

    @Override
    @Scheduled(cron = "0 0 2 * * ?") // Daily at 2am
    public void scheduledIntegrityScan() {
        log.info("[INTEGRITY_SCAN_START] Scheduled daily integrity scan starting...");
        Map<String, Object> result = runIntegrityScan();
        log.info("[INTEGRITY_SCAN_DONE] status={} compromised={} missing={}",
                result.get("overallStatus"), result.get("compromised"), result.get("fileMissing"));
    }

    private String computeSha256(String filePath) throws IOException, NoSuchAlgorithmException {
        byte[] bytes = Files.readAllBytes(Paths.get(filePath));
        MessageDigest digest = MessageDigest.getInstance("SHA-256");
        digest.update(bytes);
        StringBuilder hex = new StringBuilder();
        for (byte b : digest.digest()) hex.append(String.format("%02x", b));
        return hex.toString();
    }
}
