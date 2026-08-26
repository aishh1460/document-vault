package com.examly.springapp.service.impl;

import com.examly.springapp.model.DigitalSignature;
import com.examly.springapp.model.DigitalSignature.ValidationStatus;
import com.examly.springapp.model.Document;
import com.examly.springapp.repository.DigitalSignatureRepository;
import com.examly.springapp.repository.DocumentRepository;
import com.examly.springapp.service.DigitalSignatureService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.MessageDigest;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

@Service
@Transactional
public class DigitalSignatureServiceImpl implements DigitalSignatureService {

    private static final Logger log = LoggerFactory.getLogger(DigitalSignatureServiceImpl.class);

    private final DigitalSignatureRepository signatureRepository;
    private final DocumentRepository documentRepository;

    public DigitalSignatureServiceImpl(DigitalSignatureRepository signatureRepository,
                                       DocumentRepository documentRepository) {
        this.signatureRepository = signatureRepository;
        this.documentRepository = documentRepository;
    }

    @Override
    public DigitalSignature signDocument(Long documentId, Long signerId,
                                          String signatureData, String certificateId) {
        // Verify document exists
        documentRepository.findById(documentId)
                .filter(d -> !d.isDeleted())
                .orElseThrow(() -> new NoSuchElementException("Document not found: " + documentId));

        DigitalSignature sig = new DigitalSignature(
                documentId,
                signerId,
                signatureData != null ? signatureData : generateDefaultSignatureData(documentId, signerId),
                LocalDateTime.now(),
                certificateId,
                ValidationStatus.VALID
        );
        DigitalSignature saved = signatureRepository.save(sig);
        log.info("[DIGITAL_SIGN] doc={} signer={} cert={}", documentId, signerId, certificateId);
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public DigitalSignature validateSignature(Long signatureId) {
        DigitalSignature sig = signatureRepository.findById(signatureId)
                .orElseThrow(() -> new NoSuchElementException("Signature not found: " + signatureId));

        // Check expiry: signatures older than 2 years are considered expired
        if (sig.getTimestamp().isBefore(LocalDateTime.now().minusYears(2))) {
            sig.setValidationStatus(ValidationStatus.EXPIRED);
            signatureRepository.save(sig);
            log.info("[SIG_VALIDATE] sig={} -> EXPIRED", signatureId);
        } else if (sig.getValidationStatus() == ValidationStatus.PENDING_VALIDATION) {
            sig.setValidationStatus(ValidationStatus.VALID);
            signatureRepository.save(sig);
        }
        return sig;
    }

    @Override
    public void revokeSignature(Long signatureId, Long requesterId) {
        DigitalSignature sig = signatureRepository.findById(signatureId)
                .orElseThrow(() -> new NoSuchElementException("Signature not found: " + signatureId));
        if (!sig.getSignerId().equals(requesterId)) {
            // Also allow document owner to revoke
            Document doc = documentRepository.findById(sig.getDocumentId()).orElse(null);
            if (doc == null || !doc.getOwnerId().equals(requesterId)) {
                throw new SecurityException("Access denied: cannot revoke signature " + signatureId);
            }
        }
        sig.setValidationStatus(ValidationStatus.REVOKED);
        signatureRepository.save(sig);
        log.info("[SIG_REVOKE] sig={} by requester={}", signatureId, requesterId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DigitalSignature> getSignaturesForDocument(Long documentId) {
        return signatureRepository.findByDocumentId(documentId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DigitalSignature> getSignaturesBySigner(Long signerId) {
        return signatureRepository.findBySignerId(signerId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean isDocumentSigned(Long documentId) {
        return !signatureRepository.findValidSignaturesForDocument(documentId).isEmpty();
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> verifyDocumentIntegrity(Long documentId, Long requesterId) {
        Document doc = documentRepository.findById(documentId)
                .filter(d -> !d.isDeleted())
                .orElseThrow(() -> new NoSuchElementException("Document not found: " + documentId));

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("documentId", documentId);
        result.put("storedChecksum", doc.getChecksum());

        try {
            byte[] fileBytes = Files.readAllBytes(Paths.get(doc.getFilePath()));
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            digest.update(fileBytes);
            StringBuilder hex = new StringBuilder();
            for (byte b : digest.digest()) hex.append(String.format("%02x", b));
            String computedChecksum = hex.toString();
            result.put("computedChecksum", computedChecksum);

            boolean intact = computedChecksum.equals(doc.getChecksum());
            result.put("integrityStatus", intact ? "INTACT" : "COMPROMISED");
            result.put("isSigned", isDocumentSigned(documentId));

            List<DigitalSignature> validSigs = signatureRepository.findValidSignaturesForDocument(documentId);
            result.put("validSignatureCount", validSigs.size());
            log.info("[INTEGRITY_CHECK] doc={} intact={} signatures={}", documentId, intact, validSigs.size());
        } catch (Exception e) {
            result.put("integrityStatus", "UNVERIFIABLE");
            result.put("reason", e.getMessage());
            log.warn("[INTEGRITY_CHECK] doc={} error={}", documentId, e.getMessage());
        }
        return result;
    }

    private String generateDefaultSignatureData(Long documentId, Long signerId) {
        return String.format("VAULT-SIG-DOC%d-SIGNER%d-%d", documentId, signerId, System.currentTimeMillis());
    }
}
