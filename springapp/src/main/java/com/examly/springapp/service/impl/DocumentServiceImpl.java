package com.examly.springapp.service.impl;

import com.examly.springapp.configuration.CryptoUtils;
import com.examly.springapp.dto.DocumentResponse;
import com.examly.springapp.dto.DocumentSummaryResponse;
import com.examly.springapp.dto.DocumentVersionResponse;
import com.examly.springapp.exception.DuplicateDocumentException;
import com.examly.springapp.model.Document;
import com.examly.springapp.model.Document.DocumentCategory;
import com.examly.springapp.model.Document.DocumentStatus;
import com.examly.springapp.model.Document.SecurityClassification;
import com.examly.springapp.model.DocumentVersion;
import com.examly.springapp.model.Folder;
import com.examly.springapp.repository.DocumentRepository;
import com.examly.springapp.repository.DocumentVersionRepository;
import com.examly.springapp.repository.FolderRepository;
import com.examly.springapp.service.DocumentService;
import com.examly.springapp.service.FileValidationService;
import com.examly.springapp.service.OcrService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDate;
import java.time.LocalTime;
import javax.persistence.criteria.Predicate;
import java.util.*;

import com.examly.springapp.model.Tag;
import com.examly.springapp.repository.TagRepository;

@Service
@Transactional(readOnly = true)
public class DocumentServiceImpl implements DocumentService {

    private static final Logger log = LoggerFactory.getLogger(DocumentServiceImpl.class);

    private static final String STORAGE_ROOT = System.getProperty("vault.storage.root",
            System.getProperty("java.io.tmpdir") + "/vault/documents");

    private final DocumentRepository documentRepository;
    private final FolderRepository folderRepository;
    private final OcrService ocrService;
    private final DocumentVersionRepository documentVersionRepository;
    private final FileValidationService fileValidationService;
    private final TagRepository tagRepository;

    public DocumentServiceImpl(DocumentRepository documentRepository,
                                FolderRepository folderRepository,
                                OcrService ocrService,
                                DocumentVersionRepository documentVersionRepository,
                                FileValidationService fileValidationService,
                                TagRepository tagRepository) {
        this.documentRepository = documentRepository;
        this.folderRepository = folderRepository;
        this.ocrService = ocrService;
        this.documentVersionRepository = documentVersionRepository;
        this.fileValidationService = fileValidationService;
        this.tagRepository = tagRepository;
    }

    private Document requireDocument(Long id) {
        return documentRepository.findById(id)
                .filter(d -> !d.isDeleted())
                .orElseThrow(() -> new NoSuchElementException("Document not found: " + id));
    }

    private void assertOwner(Document doc, Long requesterId) {
        if (!doc.getOwnerId().equals(requesterId)) {
            throw new SecurityException("Access denied for document: " + doc.getId());
        }
    }

    private String computeSha256(MultipartFile file) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] buf = new byte[8192];
            int read;
            try (InputStream is = file.getInputStream()) {
                while ((read = is.read(buf)) != -1) digest.update(buf, 0, read);
            }
            StringBuilder hex = new StringBuilder();
            for (byte b : digest.digest()) hex.append(String.format("%02x", b));
            return hex.toString();
        } catch (NoSuchAlgorithmException | IOException e) {
            throw new IllegalStateException("Checksum computation failed", e);
        }
    }

    private String storeFile(MultipartFile file, String storedName, String encKey) {
        try {
            Path dir = Paths.get(STORAGE_ROOT);
            Files.createDirectories(dir);
            Path target = dir.resolve(storedName);
            byte[] fileBytes = file.getBytes();
            try {
                byte[] encrypted = CryptoUtils.encrypt(fileBytes, encKey);
                Files.write(target, encrypted);
            } catch (Exception e) {
                // Fallback: store plain if encryption fails (dev environment)
                Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);
                log.warn("Encryption failed, stored plain: {}", e.getMessage());
            }
            return target.toString();
        } catch (IOException e) {
            throw new IllegalStateException("File storage failed for: " + storedName, e);
        }
    }

    @Override
    public void triggerAudit(Long documentId, String action, Long actorId, Map<String, String> context) {
        log.info("[AUDIT] doc={} action={} actor={} ctx={}", documentId, action, actorId, context);
    }

    @Override
    @Transactional
    public DocumentResponse uploadDocument(MultipartFile file, Long ownerId, DocumentCategory category) {
        fileValidationService.validate(file);
        String mime = file.getContentType();

        String checksum = computeSha256(file);
        documentRepository.findByChecksumAndDeletedFalse(checksum).ifPresent(existing -> {
            throw new DuplicateDocumentException(existing.getId());
        });

        String uuid = UUID.randomUUID().toString();
        String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
        String storedName = uuid + (ext != null ? "." + ext : "");

        String encKey;
        try {
            encKey = CryptoUtils.generateKey();
        } catch (Exception e) {
            encKey = Base64.getEncoder().encodeToString(uuid.getBytes());
        }

        String filePath = storeFile(file, storedName, encKey);

        // OCR text extraction
        String extractedText = "";
        try {
            extractedText = ocrService.extractText(file);
        } catch (Exception e) {
            log.warn("OCR extraction failed: {}", e.getMessage());
        }

        DocumentCategory resolvedCategory = (category != null) ? category : DocumentCategory.OTHER;

        Document doc = Document.builder()
                .fileName(storedName)
                .originalFileName(Objects.requireNonNullElse(file.getOriginalFilename(), storedName))
                .mimeType(Objects.requireNonNullElse(mime, "application/octet-stream"))
                .fileSize(file.getSize())
                .filePath(filePath)
                .checksum(checksum)
                .encryptedContentPath(filePath)
                .encryptionKeyId(encKey)
                .ownerId(ownerId)
                .documentCategory(resolvedCategory)
                .securityClassification(SecurityClassification.INTERNAL)
                .status(DocumentStatus.ACTIVE)
                .deleted(false)
                .build();

        doc.setExtractedText(extractedText);

        Document saved = documentRepository.save(doc);
        log.info("Document uploaded: id={} owner={} category={}", saved.getId(), ownerId, resolvedCategory);
        return DocumentResponse.from(saved);
    }

    @Override
    public ResponseEntity<byte[]> downloadDocument(Long documentId, Long requesterId) {
        Document doc = requireDocument(documentId);
        assertOwner(doc, requesterId);
        triggerAudit(documentId, "DOWNLOAD", requesterId, Map.of());
        try {
            byte[] rawContent = Files.readAllBytes(Paths.get(doc.getFilePath()));
            byte[] content;
            try {
                content = CryptoUtils.decrypt(rawContent, doc.getEncryptionKeyId());
            } catch (Exception e) {
                content = rawContent; // fallback if not encrypted
            }
            String mimeType = doc.getMimeType() != null ? doc.getMimeType() : "application/octet-stream";
            String filename = doc.getOriginalFileName() != null ? doc.getOriginalFileName() : doc.getFileName();
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(mimeType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(content);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to read document: " + documentId, e);
        }
    }

    @Override
    public DocumentResponse getDocumentById(Long documentId, Long requesterId) {
        Document doc = requireDocument(documentId);
        assertOwner(doc, requesterId);
        return DocumentResponse.from(doc);
    }

    @Override
    public Page<DocumentSummaryResponse> getAllDocuments(Pageable pageable) {
        return documentRepository.findAllActive(pageable).map(DocumentSummaryResponse::from);
    }

    @Override
    public Page<DocumentSummaryResponse> getDocumentsByOwner(Long ownerId, Pageable pageable) {
        return documentRepository.findByOwnerIdAndDeletedFalse(ownerId, pageable).map(DocumentSummaryResponse::from);
    }

    @Override
    public Page<DocumentSummaryResponse> getDocumentsByStatus(DocumentStatus status, Pageable pageable) {
        return documentRepository.findByStatusAndDeletedFalse(status, pageable).map(DocumentSummaryResponse::from);
    }

    @Override
    public Page<DocumentSummaryResponse> getDocumentsByCategory(DocumentCategory category, Pageable pageable) {
        return documentRepository.findByDocumentCategoryAndDeletedFalse(category, pageable).map(DocumentSummaryResponse::from);
    }

    @Override
    public Page<DocumentSummaryResponse> getDocumentsByClassification(SecurityClassification classification, Pageable pageable) {
        Specification<Document> spec = (root, query, cb) -> cb.and(
                cb.equal(root.get("securityClassification"), classification),
                cb.isFalse(root.get("deleted"))
        );
        return documentRepository.findAll(spec, pageable).map(DocumentSummaryResponse::from);
    }

    @Override
    public Page<DocumentSummaryResponse> searchDocuments(String query, Pageable pageable) {
        return searchDocuments(query, null, null, null, null, null, null, null, null, pageable);
    }

    @Override
    public Page<DocumentSummaryResponse> searchDocumentsByOwner(Long ownerId, String query, Pageable pageable) {
        return searchDocuments(query, ownerId, null, null, null, null, null, null, null, pageable);
    }

    @Override
    public Page<DocumentSummaryResponse> searchDocuments(
            String query,
            Long ownerId,
            DocumentCategory category,
            DocumentStatus status,
            SecurityClassification classification,
            Long folderId,
            String tag,
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable) {

        Specification<Document> spec = (root, q, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (status == DocumentStatus.DELETED) {
                predicates.add(cb.isTrue(root.get("deleted")));
            } else {
                predicates.add(cb.isFalse(root.get("deleted")));
            }

            if (ownerId != null) {
                predicates.add(cb.equal(root.get("ownerId"), ownerId));
            }

            if (category != null) {
                predicates.add(cb.equal(root.get("documentCategory"), category));
            }

            if (status != null && status != DocumentStatus.DELETED) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (classification != null) {
                predicates.add(cb.equal(root.get("securityClassification"), classification));
            }

            if (folderId != null) {
                predicates.add(cb.equal(root.get("folder").get("id"), folderId));
            }

            if (tag != null && !tag.isBlank()) {
                predicates.add(cb.isMember(tag.trim().toLowerCase(), root.get("tags")));
            }

            if (startDate != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), startDate.atStartOfDay()));
            }

            if (endDate != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), endDate.atTime(LocalTime.MAX)));
            }

            if (query != null && !query.trim().isEmpty()) {
                String pattern = "%" + query.trim().toLowerCase() + "%";
                Predicate fileNameMatch = cb.like(cb.lower(root.get("fileName")), pattern);
                Predicate origFileNameMatch = cb.like(cb.lower(root.get("originalFileName")), pattern);
                Predicate extractedTextMatch = cb.like(cb.lower(root.get("extractedText")), pattern);
                predicates.add(cb.or(fileNameMatch, origFileNameMatch, extractedTextMatch));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return documentRepository.findAll(spec, pageable).map(DocumentSummaryResponse::from);
    }

    @Override
    @Transactional
    public DocumentResponse updateMetadata(Long documentId, Long requesterId) {
        Document doc = requireDocument(documentId);
        assertOwner(doc, requesterId);
        return DocumentResponse.from(documentRepository.save(doc));
    }

    @Override
    @Transactional
    public DocumentResponse renameDocument(Long documentId, String newName, Long requesterId) {
        Document doc = requireDocument(documentId);
        assertOwner(doc, requesterId);
        if (newName != null && !newName.isBlank()) doc.setOriginalFileName(newName);
        return DocumentResponse.from(documentRepository.save(doc));
    }

    @Override
    @Transactional
    public DocumentResponse moveDocument(Long documentId, DocumentCategory category, Long requesterId) {
        Document doc = requireDocument(documentId);
        assertOwner(doc, requesterId);
        if (category != null) doc.setDocumentCategory(category);
        return DocumentResponse.from(documentRepository.save(doc));
    }

    @Override
    @Transactional
    public DocumentResponse moveDocumentToFolder(Long documentId, Long folderId, Long requesterId) {
        Document doc = requireDocument(documentId);
        assertOwner(doc, requesterId);
        if (folderId == null) {
            doc.setFolder(null);
        } else {
            Folder folder = folderRepository.findById(folderId)
                    .orElseThrow(() -> new NoSuchElementException("Folder not found: " + folderId));
            if (!folder.getOwnerId().equals(requesterId)) {
                throw new SecurityException("Access denied for folder: " + folderId);
            }
            doc.setFolder(folder);
        }
        return DocumentResponse.from(documentRepository.save(doc));
    }

    @Override
    @Transactional
    public DocumentResponse toggleFavorite(Long documentId, Long requesterId) {
        Document doc = requireDocument(documentId);
        assertOwner(doc, requesterId);
        doc.setFavorite(!doc.isFavorite());
        return DocumentResponse.from(documentRepository.save(doc));
    }

    @Override
    public Page<DocumentSummaryResponse> getFavoriteDocuments(Long userId, Pageable pageable) {
        Specification<Document> spec = (root, query, cb) -> cb.and(
                cb.equal(root.get("ownerId"), userId),
                cb.isTrue(root.get("favorite")),
                cb.isFalse(root.get("deleted"))
        );
        return documentRepository.findAll(spec, pageable).map(DocumentSummaryResponse::from);
    }

    @Override
    public Page<DocumentSummaryResponse> getTrashDocuments(Long userId, Pageable pageable) {
        Specification<Document> spec = (root, query, cb) -> cb.and(
                cb.equal(root.get("ownerId"), userId),
                cb.isTrue(root.get("deleted"))
        );
        return documentRepository.findAll(spec, pageable).map(DocumentSummaryResponse::from);
    }

    @Override
    @Transactional
    public void permanentlyDeleteDocument(Long documentId, Long requesterId) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new NoSuchElementException("Document not found: " + documentId));
        if (!doc.getOwnerId().equals(requesterId)) {
            throw new SecurityException("Access denied for document: " + documentId);
        }
        // Delete file from disk
        try {
            Path filePath = Paths.get(doc.getFilePath());
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Could not delete file from disk: {}", e.getMessage());
        }
        documentRepository.delete(doc);
        log.info("Document permanently deleted: id={}", documentId);
    }

    @Override
    @Transactional
    public void deleteDocument(Long documentId, Long requesterId) {
        Document doc = requireDocument(documentId);
        assertOwner(doc, requesterId);
        documentRepository.softDeleteById(documentId);
        log.info("Document soft-deleted: doc={}", documentId);
    }

    @Override
    @Transactional
    public DocumentResponse restoreDocument(Long documentId, Long requesterId) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new NoSuchElementException("Document not found: " + documentId));
        if (!doc.isDeleted()) throw new IllegalStateException("Document is not in trash: " + documentId);
        assertOwner(doc, requesterId);
        doc.setDeleted(false);
        doc.setStatus(DocumentStatus.ACTIVE);
        return DocumentResponse.from(documentRepository.save(doc));
    }

    @Override
    @Transactional
    public DocumentResponse archiveDocument(Long documentId, Long requesterId) {
        Document doc = requireDocument(documentId);
        assertOwner(doc, requesterId);
        doc.setStatus(DocumentStatus.ARCHIVED);
        doc.setArchiveDate(LocalDate.now());
        return DocumentResponse.from(documentRepository.save(doc));
    }

    @Override
    @Transactional
    public DocumentResponse uploadNewVersion(Long documentId, MultipartFile file, Long requesterId, String changeDescription) {
        fileValidationService.validate(file);
        Document doc = requireDocument(documentId);
        assertOwner(doc, requesterId);

        // ── Phase 6: Snapshot current document state into DocumentVersion ──
        Integer nextVersionNumber = documentVersionRepository
                .findMaxVersionNumber(documentId).orElse(0) + 1;

        DocumentVersion snapshot = new DocumentVersion();
        snapshot.setDocumentId(documentId);
        snapshot.setVersionNumber(nextVersionNumber);
        snapshot.setFileName(doc.getFileName());
        snapshot.setOriginalFileName(doc.getOriginalFileName());
        snapshot.setFileSize(doc.getFileSize());
        snapshot.setChecksum(doc.getChecksum());
        snapshot.setFilePath(doc.getFilePath());
        snapshot.setEncryptionKeyId(doc.getEncryptionKeyId());
        snapshot.setChangeDescription(changeDescription);
        snapshot.setUploadedBy(requesterId);
        documentVersionRepository.save(snapshot);

        // ── Now overwrite the document with the new file ──
        String checksum = computeSha256(file);
        String uuid = UUID.randomUUID().toString();
        String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
        String storedName = uuid + (ext != null ? "." + ext : "");

        String encKey;
        try { encKey = CryptoUtils.generateKey(); } catch (Exception e) { encKey = doc.getEncryptionKeyId(); }

        String filePath = storeFile(file, storedName, encKey);

        doc.setFileName(storedName);
        doc.setOriginalFileName(Objects.requireNonNullElse(file.getOriginalFilename(), storedName));
        doc.setFileSize(file.getSize());
        doc.setFilePath(filePath);
        doc.setChecksum(checksum);
        doc.setMimeType(Objects.requireNonNullElse(file.getContentType(), "application/octet-stream"));
        doc.setEncryptionKeyId(encKey);

        // Re-run OCR on new version
        try { doc.setExtractedText(ocrService.extractText(file)); } catch (Exception ignored) {}

        Document saved = documentRepository.save(doc);
        log.info("Document new version saved: docId={} versionNumber={} uploader={}", documentId, nextVersionNumber, requesterId);
        return DocumentResponse.from(saved);
    }

    @Override
    public Page<DocumentVersionResponse> getVersionHistory(Long documentId, Long requesterId, Pageable pageable) {
        Document doc = requireDocument(documentId);
        assertOwner(doc, requesterId);
        return documentVersionRepository
                .findByDocumentIdOrderByVersionNumberDesc(documentId, pageable)
                .map(DocumentVersionResponse::from);
    }

    @Override
    @Transactional
    public DocumentResponse restoreVersion(Long documentId, Integer targetVersion, Long requesterId) {
        Document doc = requireDocument(documentId);
        assertOwner(doc, requesterId);

        DocumentVersion version = documentVersionRepository
                .findByDocumentIdAndVersionNumber(documentId, targetVersion)
                .orElseThrow(() -> new NoSuchElementException(
                        "Version " + targetVersion + " not found for document " + documentId));

        // Snapshot current state before restoring
        Integer nextVersionNumber = documentVersionRepository
                .findMaxVersionNumber(documentId).orElse(0) + 1;
        DocumentVersion currentSnapshot = new DocumentVersion();
        currentSnapshot.setDocumentId(documentId);
        currentSnapshot.setVersionNumber(nextVersionNumber);
        currentSnapshot.setFileName(doc.getFileName());
        currentSnapshot.setOriginalFileName(doc.getOriginalFileName());
        currentSnapshot.setFileSize(doc.getFileSize());
        currentSnapshot.setChecksum(doc.getChecksum());
        currentSnapshot.setFilePath(doc.getFilePath());
        currentSnapshot.setEncryptionKeyId(doc.getEncryptionKeyId());
        currentSnapshot.setChangeDescription("Auto-snapshot before restore to version " + targetVersion);
        currentSnapshot.setUploadedBy(requesterId);
        documentVersionRepository.save(currentSnapshot);

        // Restore file metadata from the target version
        doc.setFileName(version.getFileName());
        doc.setOriginalFileName(version.getOriginalFileName());
        doc.setFileSize(version.getFileSize());
        doc.setChecksum(version.getChecksum());
        doc.setFilePath(version.getFilePath());
        doc.setEncryptionKeyId(version.getEncryptionKeyId());

        Document saved = documentRepository.save(doc);
        log.info("[VERSION_RESTORE] doc={} restoredTo={} by={}", documentId, targetVersion, requesterId);
        return DocumentResponse.from(saved);
    }

    @Override
    @Transactional
    public DocumentResponse addTag(Long documentId, String tag, Long requesterId) {
        Document doc = requireDocument(documentId);
        assertOwner(doc, requesterId);
        if (tag != null && !tag.isBlank()) {
            String normalizedTag = tag.trim().toLowerCase();
            doc.getTags().add(normalizedTag);
            if (!tagRepository.existsByName(normalizedTag)) {
                tagRepository.save(new Tag(normalizedTag));
            }
        }
        return DocumentResponse.from(documentRepository.save(doc));
    }

    @Override
    @Transactional
    public DocumentResponse removeTag(Long documentId, String tag, Long requesterId) {
        Document doc = requireDocument(documentId);
        assertOwner(doc, requesterId);
        if (tag != null) {
            doc.getTags().remove(tag.trim().toLowerCase());
        }
        return DocumentResponse.from(documentRepository.save(doc));
    }

    @Override
    @Transactional
    public DocumentResponse attachTag(Long documentId, Long tagId, Long requesterId) {
        Document doc = requireDocument(documentId);
        assertOwner(doc, requesterId);
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new NoSuchElementException("Tag not found: " + tagId));
        doc.getTags().add(tag.getName().toLowerCase());
        return DocumentResponse.from(documentRepository.save(doc));
    }

    @Override
    @Transactional
    public DocumentResponse detachTag(Long documentId, Long tagId, Long requesterId) {
        Document doc = requireDocument(documentId);
        assertOwner(doc, requesterId);
        tagRepository.findById(tagId).ifPresent(tag -> doc.getTags().remove(tag.getName().toLowerCase()));
        return DocumentResponse.from(documentRepository.save(doc));
    }

    @Override
    public List<DocumentSummaryResponse> getExpiredDocuments(Long ownerId) {
        LocalDate today = LocalDate.now();
        List<Document> expiredDocs = (ownerId != null)
                ? documentRepository.findExpiredRetentionByOwner(ownerId, today)
                : documentRepository.findExpiredRetention(today);
        return expiredDocs.stream().map(DocumentSummaryResponse::from).toList();
    }

    @Override
    @Transactional
    public int checkAndMarkExpiredDocuments() {
        LocalDate today = LocalDate.now();
        List<Document> expiredDocs = documentRepository.findExpiredRetention(today);
        int count = 0;
        for (Document doc : expiredDocs) {
            if (doc.getStatus() != DocumentStatus.EXPIRED) {
                doc.setStatus(DocumentStatus.EXPIRED);
                documentRepository.save(doc);
                count++;
            }
        }
        log.info("[EXPIRY_CHECK] Checked at {}, marked {} documents as EXPIRED", today, count);
        return count;
    }

    @Override
    @Transactional
    public int emptyTrash(Long ownerId) {
        List<Document> trashDocs = (ownerId != null)
                ? documentRepository.findByOwnerIdAndDeletedTrue(ownerId)
                : documentRepository.findByDeletedTrue();
        int count = 0;
        for (Document doc : trashDocs) {
            try {
                if (doc.getFilePath() != null) {
                    Files.deleteIfExists(Paths.get(doc.getFilePath()));
                }
            } catch (IOException e) {
                log.warn("Could not delete file from disk during empty trash: {}", e.getMessage());
            }
            documentRepository.delete(doc);
            count++;
        }
        log.info("[EMPTY_TRASH] Purged {} documents from trash for owner={}", count, ownerId);
        return count;
    }

    @Override
    @Transactional
    public int purgeExpiredTrash(int retentionDays) {
        java.time.LocalDateTime cutoff = java.time.LocalDateTime.now().minusDays(retentionDays);
        List<Document> expiredTrash = documentRepository.findByDeletedTrueAndUpdatedAtBefore(cutoff);
        int count = 0;
        for (Document doc : expiredTrash) {
            try {
                if (doc.getFilePath() != null) {
                    Files.deleteIfExists(Paths.get(doc.getFilePath()));
                }
            } catch (IOException e) {
                log.warn("Could not delete file from disk during retention purge: {}", e.getMessage());
            }
            documentRepository.delete(doc);
            count++;
        }
        log.info("[TRASH_RETENTION_PURGE] Purged {} expired trash documents older than {} days", count, retentionDays);
        return count;
    }
}
