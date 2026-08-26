package com.examly.springapp.controller;

import com.examly.springapp.dto.DocumentResponse;
import com.examly.springapp.dto.DocumentSummaryResponse;
import com.examly.springapp.dto.DocumentVersionResponse;
import com.examly.springapp.model.Document.DocumentCategory;
import com.examly.springapp.model.Document.DocumentStatus;
import com.examly.springapp.model.Document.SecurityClassification;
import com.examly.springapp.service.DocumentService;
import com.examly.springapp.service.OcrService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.format.annotation.DateTimeFormat;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/documents")
@Validated
@Tag(name = "Document Management", description = "APIs for the Digital Document Vault")
public class DocumentController {

    private final DocumentService documentService;
    private final OcrService ocrService;

    public DocumentController(DocumentService documentService, OcrService ocrService) {
        this.documentService = documentService;
        this.ocrService = ocrService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload a new document")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Document uploaded successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid file or request")
    })
    public ResponseEntity<DocumentResponse> uploadDocument(
            @RequestPart("file") MultipartFile file,
            @RequestParam @NotNull @Positive Long ownerId,
            @RequestParam(required = false) DocumentCategory category) {
        return ResponseEntity.status(HttpStatus.CREATED).body(documentService.uploadDocument(file, ownerId, category));
    }

    @GetMapping
    @Operation(summary = "Get all documents")
    public ResponseEntity<Page<DocumentSummaryResponse>> getAllDocuments(
            @RequestParam(required = false) Long ownerId,
            @RequestParam(required = false) DocumentStatus status,
            @RequestParam(required = false) DocumentCategory category,
            @RequestParam(required = false) SecurityClassification classification,
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {

        Page<DocumentSummaryResponse> page;
        if (classification != null) page = documentService.getDocumentsByClassification(classification, pageable);
        else if (status != null) page = documentService.getDocumentsByStatus(status, pageable);
        else if (category != null) page = documentService.getDocumentsByCategory(category, pageable);
        else if (ownerId != null) page = documentService.getDocumentsByOwner(ownerId, pageable);
        else page = documentService.getAllDocuments(pageable);
        return ResponseEntity.ok(page);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get document by ID")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Document found"),
        @ApiResponse(responseCode = "404", description = "Document not found")
    })
    public ResponseEntity<DocumentResponse> getDocumentById(
            @PathVariable @Positive Long id,
            @RequestParam @NotNull @Positive Long requesterId) {
        return ResponseEntity.ok(documentService.getDocumentById(id, requesterId));
    }

    @GetMapping("/search")
    @Operation(summary = "Advanced search documents", description = "Multi-criteria search supporting text, category, status, classification, folder, tag, date range, and owner filters")
    public ResponseEntity<Page<DocumentSummaryResponse>> searchDocuments(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) Long ownerId,
            @RequestParam(required = false) DocumentCategory category,
            @RequestParam(required = false) DocumentStatus status,
            @RequestParam(required = false) SecurityClassification classification,
            @RequestParam(required = false) Long folderId,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @PageableDefault(size = 20) Pageable pageable) {
        Page<DocumentSummaryResponse> page = documentService.searchDocuments(
                q, ownerId, category, status, classification, folderId, tag, startDate, endDate, pageable);
        return ResponseEntity.ok(page);
    }

    @PatchMapping("/{id}/rename")
    @Operation(summary = "Rename a document")
    public ResponseEntity<DocumentResponse> renameDocument(
            @PathVariable @Positive Long id,
            @RequestParam @NotNull @Positive Long requesterId,
            @RequestParam String newName) {
        return ResponseEntity.ok(documentService.renameDocument(id, newName, requesterId));
    }

    @PatchMapping("/{id}/move")
    @Operation(summary = "Move a document to a different category")
    public ResponseEntity<DocumentResponse> moveDocument(
            @PathVariable @Positive Long id,
            @RequestParam @NotNull @Positive Long requesterId,
            @RequestParam DocumentCategory category) {
        return ResponseEntity.ok(documentService.moveDocument(id, category, requesterId));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Soft-delete a document")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Document deleted"),
        @ApiResponse(responseCode = "404", description = "Document not found")
    })
    public ResponseEntity<Void> deleteDocument(
            @PathVariable @Positive Long id,
            @RequestParam @NotNull @Positive Long requesterId) {
        documentService.deleteDocument(id, requesterId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/restore")
    @Operation(summary = "Restore a soft-deleted document")
    public ResponseEntity<DocumentResponse> restoreDocument(
            @PathVariable @Positive Long id,
            @RequestParam @NotNull @Positive Long requesterId) {
        return ResponseEntity.ok(documentService.restoreDocument(id, requesterId));
    }

    @PatchMapping("/{id}/archive")
    @Operation(summary = "Archive a document")
    public ResponseEntity<DocumentResponse> archiveDocument(
            @PathVariable @Positive Long id,
            @RequestParam @NotNull @Positive Long requesterId) {
        return ResponseEntity.ok(documentService.archiveDocument(id, requesterId));
    }

    @GetMapping("/download/{id}")
    @Operation(summary = "Download a document")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "File returned"),
        @ApiResponse(responseCode = "404", description = "Document not found")
    })
    public ResponseEntity<byte[]> downloadDocument(
            @PathVariable @Positive Long id,
            @RequestParam @NotNull @Positive Long requesterId) {
        return documentService.downloadDocument(id, requesterId);
    }

    @PostMapping("/{id}/version")
    @Operation(summary = "Upload a new version of a document")
    public ResponseEntity<DocumentResponse> uploadNewVersion(
            @PathVariable @Positive Long id,
            @RequestPart("file") MultipartFile file,
            @RequestParam @NotNull @Positive Long requesterId,
            @RequestParam(required = false, defaultValue = "") String changeDescription) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(documentService.uploadNewVersion(id, file, requesterId, changeDescription));
    }

    @GetMapping("/{id}/versions")
    @Operation(summary = "Get version history of a document")
    public ResponseEntity<Page<DocumentVersionResponse>> getVersionHistory(
            @PathVariable @Positive Long id,
            @RequestParam @NotNull @Positive Long requesterId,
            @PageableDefault(size = 20, sort = "versionNumber") Pageable pageable) {
        return ResponseEntity.ok(documentService.getVersionHistory(id, requesterId, pageable));
    }

    @PatchMapping("/{id}/version/{targetVersion}")
    @Operation(summary = "Restore document to a specific version")
    public ResponseEntity<DocumentResponse> restoreVersion(
            @PathVariable @Positive Long id,
            @PathVariable @Positive Integer targetVersion,
            @RequestParam @NotNull @Positive Long requesterId) {
        return ResponseEntity.ok(documentService.restoreVersion(id, targetVersion, requesterId));
    }

    @GetMapping("/trash")
    @Operation(summary = "Get trash (soft-deleted documents)", description = "Retrieve all soft-deleted documents for a user.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Trash documents retrieved")
    })
    public ResponseEntity<Page<DocumentSummaryResponse>> getTrash(
            @RequestParam @NotNull @Positive Long ownerId,
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(documentService.getTrashDocuments(ownerId, pageable));
    }

    @DeleteMapping("/trash")
    @Operation(summary = "Empty trash", description = "Permanently delete all documents in trash for a user or globally.")
    public ResponseEntity<Map<String, Object>> emptyTrash(
            @RequestParam(required = false) Long ownerId) {
        int count = documentService.emptyTrash(ownerId);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "deletedCount", count
        ));
    }

    @PostMapping("/trash/purge")
    @Operation(summary = "Purge expired trash retention", description = "Purge trash items older than specified retention days.")
    public ResponseEntity<Map<String, Object>> purgeExpiredTrash(
            @RequestParam(defaultValue = "30") int retentionDays) {
        int count = documentService.purgeExpiredTrash(retentionDays);
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "purgedCount", count,
                "retentionDays", retentionDays
        ));
    }

    @DeleteMapping("/{id}/permanent")
    @Operation(summary = "Permanently delete a document", description = "Permanently delete a document and remove its file from disk. This cannot be undone.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Document permanently deleted"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Document not found")
    })
    public ResponseEntity<Void> permanentlyDelete(
            @PathVariable @Positive Long id,
            @RequestParam @NotNull @Positive Long requesterId) {
        documentService.permanentlyDeleteDocument(id, requesterId);
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/move-to-folder")
    @Operation(summary = "Move document to a folder", description = "Assign the document to a folder. Pass folderId=null to remove from folder.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Document moved to folder"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Document or folder not found")
    })
    public ResponseEntity<DocumentResponse> moveToFolder(
            @PathVariable @Positive Long id,
            @RequestParam @NotNull @Positive Long requesterId,
            @RequestParam(required = false) Long folderId) {
        return ResponseEntity.ok(documentService.moveDocumentToFolder(id, folderId, requesterId));
    }

    @GetMapping("/{id}/ocr")
    @Operation(summary = "Get extracted OCR text for a document")
    public ResponseEntity<Map<String, Object>> getDocumentOcr(
            @PathVariable @Positive Long id,
            @RequestParam(required = false) Long requesterId) {
        Long rId = (requesterId != null) ? requesterId : 1L;
        DocumentResponse doc = documentService.getDocumentById(id, rId);
        String text = (doc.getExtractedText() != null) ? doc.getExtractedText() : "";
        return ResponseEntity.ok(Map.of(
                "documentId", id,
                "extractedText", text,
                "status", "success"
        ));
    }

    @PostMapping("/{id}/ocr")
    @Operation(summary = "Trigger OCR processing for a document")
    public ResponseEntity<Map<String, Object>> processDocumentOcr(
            @PathVariable @Positive Long id,
            @RequestParam(required = false) Long requesterId) {
        Long rId = (requesterId != null) ? requesterId : 1L;
        documentService.getDocumentById(id, rId); // access check
        ocrService.processDocumentOcrAsync(id);
        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of(
                "documentId", id,
                "status", "PROCESSING",
                "message", "OCR text extraction initiated asynchronously"
        ));
    }

    @PostMapping("/{id}/tags/{tagId}")
    @Operation(summary = "Attach tag to document by tag ID")
    public ResponseEntity<DocumentResponse> attachTag(
            @PathVariable @Positive Long id,
            @PathVariable @Positive Long tagId,
            @RequestParam(required = false) Long requesterId) {
        Long rId = (requesterId != null) ? requesterId : 1L;
        return ResponseEntity.ok(documentService.attachTag(id, tagId, rId));
    }

    @DeleteMapping("/{id}/tags/{tagId}")
    @Operation(summary = "Detach tag from document by tag ID")
    public ResponseEntity<DocumentResponse> detachTag(
            @PathVariable @Positive Long id,
            @PathVariable @Positive Long tagId,
            @RequestParam(required = false) Long requesterId) {
        Long rId = (requesterId != null) ? requesterId : 1L;
        return ResponseEntity.ok(documentService.detachTag(id, tagId, rId));
    }

    @PostMapping("/{id}/tags")
    @Operation(summary = "Add tag to document by name")
    public ResponseEntity<DocumentResponse> addTagByName(
            @PathVariable @Positive Long id,
            @RequestBody Map<String, String> body,
            @RequestParam(required = false) Long requesterId) {
        Long rId = (requesterId != null) ? requesterId : 1L;
        String tagName = body.getOrDefault("name", body.getOrDefault("tag", ""));
        return ResponseEntity.ok(documentService.addTag(id, tagName, rId));
    }

    @DeleteMapping("/{id}/tags")
    @Operation(summary = "Remove tag from document by name")
    public ResponseEntity<DocumentResponse> removeTagByName(
            @PathVariable @Positive Long id,
            @RequestParam String name,
            @RequestParam(required = false) Long requesterId) {
        Long rId = (requesterId != null) ? requesterId : 1L;
        return ResponseEntity.ok(documentService.removeTag(id, name, rId));
    }

    @GetMapping("/{id}/tags")
    @Operation(summary = "Get tags for a document")
    public ResponseEntity<Set<String>> getDocumentTags(
            @PathVariable @Positive Long id,
            @RequestParam(required = false) Long requesterId) {
        Long rId = (requesterId != null) ? requesterId : 1L;
        DocumentResponse doc = documentService.getDocumentById(id, rId);
        return ResponseEntity.ok(doc.getTags() != null ? doc.getTags() : Set.of());
    }

    @GetMapping("/expired")
    @Operation(summary = "Get expired documents based on retention date")
    public ResponseEntity<List<DocumentSummaryResponse>> getExpiredDocuments(
            @RequestParam(required = false) Long ownerId) {
        return ResponseEntity.ok(documentService.getExpiredDocuments(ownerId));
    }

    @PostMapping("/expired/check")
    @Operation(summary = "Trigger system-wide expiry detection and mark expired documents")
    public ResponseEntity<Map<String, Object>> checkExpiredDocuments() {
        int marked = documentService.checkAndMarkExpiredDocuments();
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "markedExpiredCount", marked,
                "checkedDate", LocalDate.now().toString()
        ));
    }
}

