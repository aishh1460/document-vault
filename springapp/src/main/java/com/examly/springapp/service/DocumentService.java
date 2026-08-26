package com.examly.springapp.service;

import com.examly.springapp.dto.DocumentResponse;
import com.examly.springapp.dto.DocumentSummaryResponse;
import com.examly.springapp.dto.DocumentVersionResponse;
import com.examly.springapp.model.Document.DocumentCategory;
import com.examly.springapp.model.Document.DocumentStatus;
import com.examly.springapp.model.Document.SecurityClassification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public interface DocumentService {

    DocumentResponse uploadDocument(MultipartFile file, Long ownerId, DocumentCategory category);

    ResponseEntity<byte[]> downloadDocument(Long documentId, Long requesterId);

    DocumentResponse getDocumentById(Long documentId, Long requesterId);

    Page<DocumentSummaryResponse> getAllDocuments(Pageable pageable);

    Page<DocumentSummaryResponse> getDocumentsByOwner(Long ownerId, Pageable pageable);

    Page<DocumentSummaryResponse> getDocumentsByStatus(DocumentStatus status, Pageable pageable);

    Page<DocumentSummaryResponse> getDocumentsByCategory(DocumentCategory category, Pageable pageable);

    Page<DocumentSummaryResponse> getDocumentsByClassification(SecurityClassification classification, Pageable pageable);

    Page<DocumentSummaryResponse> searchDocuments(String query, Pageable pageable);

    Page<DocumentSummaryResponse> searchDocumentsByOwner(Long ownerId, String query, Pageable pageable);

    Page<DocumentSummaryResponse> searchDocuments(
            String query,
            Long ownerId,
            DocumentCategory category,
            DocumentStatus status,
            SecurityClassification classification,
            Long folderId,
            String tag,
            LocalDate startDate,
            LocalDate endDate,
            Pageable pageable);

    DocumentResponse updateMetadata(Long documentId, Long requesterId);

    DocumentResponse renameDocument(Long documentId, String newName, Long requesterId);

    DocumentResponse moveDocument(Long documentId, DocumentCategory category, Long requesterId);

    void deleteDocument(Long documentId, Long requesterId);

    DocumentResponse restoreDocument(Long documentId, Long requesterId);

    DocumentResponse archiveDocument(Long documentId, Long requesterId);

    DocumentResponse uploadNewVersion(Long documentId, MultipartFile file, Long requesterId, String changeDescription);

    Page<DocumentVersionResponse> getVersionHistory(Long documentId, Long requesterId, Pageable pageable);

    DocumentResponse restoreVersion(Long documentId, Integer targetVersion, Long requesterId);

    void triggerAudit(Long documentId, String action, Long actorId, Map<String, String> context);

    DocumentResponse moveDocumentToFolder(Long documentId, Long folderId, Long requesterId);

    DocumentResponse toggleFavorite(Long documentId, Long requesterId);

    Page<DocumentSummaryResponse> getFavoriteDocuments(Long userId, Pageable pageable);

    Page<DocumentSummaryResponse> getTrashDocuments(Long userId, Pageable pageable);

    void permanentlyDeleteDocument(Long documentId, Long requesterId);

    DocumentResponse addTag(Long documentId, String tag, Long requesterId);

    DocumentResponse removeTag(Long documentId, String tag, Long requesterId);

    DocumentResponse attachTag(Long documentId, Long tagId, Long requesterId);

    DocumentResponse detachTag(Long documentId, Long tagId, Long requesterId);

    List<DocumentSummaryResponse> getExpiredDocuments(Long ownerId);

    int checkAndMarkExpiredDocuments();

    int emptyTrash(Long ownerId);

    int purgeExpiredTrash(int retentionDays);
}
