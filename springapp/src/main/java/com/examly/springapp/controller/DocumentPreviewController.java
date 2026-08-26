package com.examly.springapp.controller;

import com.examly.springapp.model.Document;
import com.examly.springapp.repository.DocumentRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.Map;
import java.util.NoSuchElementException;

/**
 * Phase 35 — Document Thumbnails
 * Phase 36 — Streaming Preview
 *
 * Provides thumbnail placeholder responses and streaming document preview endpoints.
 * Actual thumbnail generation would require a library like PDF Renderer or AWT;
 * here we return the first 2KB of a document as a "preview chunk" and
 * provide a metadata-based thumbnail placeholder for images.
 */
@RestController
@RequestMapping("/api/preview")
@Validated
@Tag(name = "Document Preview", description = "Document thumbnails and streaming preview APIs")
public class DocumentPreviewController {

    private static final Logger log = LoggerFactory.getLogger(DocumentPreviewController.class);
    private static final int PREVIEW_CHUNK_BYTES = 2048;

    private final DocumentRepository documentRepository;

    public DocumentPreviewController(DocumentRepository documentRepository) {
        this.documentRepository = documentRepository;
    }

    /**
     * Phase 35 — Thumbnail endpoint.
     * Returns a JSON descriptor for the thumbnail (real file type + metadata).
     * For image files returns image/jpeg type hint.
     * For PDFs returns a PDF badge.
     */
    @GetMapping("/{documentId}/thumbnail")
    @Operation(summary = "Get document thumbnail descriptor",
               description = "Returns metadata describing the thumbnail to render. For images, the frontend can render the actual file. For PDFs, returns a PDF type indicator.")
    public ResponseEntity<Map<String, Object>> getThumbnail(
            @PathVariable @Positive Long documentId,
            @RequestParam @NotNull @Positive Long requesterId) {
        Document doc = documentRepository.findById(documentId)
                .filter(d -> !d.isDeleted())
                .orElseThrow(() -> new NoSuchElementException("Document not found: " + documentId));

        String mime = doc.getMimeType() != null ? doc.getMimeType() : "application/octet-stream";
        String thumbnailType;
        String iconEmoji;

        if (mime.startsWith("image/")) {
            thumbnailType = "IMAGE";
            iconEmoji = "🖼️";
        } else if (mime.equals("application/pdf")) {
            thumbnailType = "PDF";
            iconEmoji = "📄";
        } else if (mime.contains("word") || mime.contains("document")) {
            thumbnailType = "WORD";
            iconEmoji = "📝";
        } else if (mime.contains("sheet") || mime.contains("excel")) {
            thumbnailType = "SPREADSHEET";
            iconEmoji = "📊";
        } else if (mime.startsWith("text/")) {
            thumbnailType = "TEXT";
            iconEmoji = "📃";
        } else {
            thumbnailType = "FILE";
            iconEmoji = "📁";
        }

        return ResponseEntity.ok(Map.of(
                "documentId", documentId,
                "fileName", doc.getOriginalFileName() != null ? doc.getOriginalFileName() : doc.getFileName(),
                "mimeType", mime,
                "thumbnailType", thumbnailType,
                "iconEmoji", iconEmoji,
                "fileSize", doc.getFileSize() != null ? doc.getFileSize() : 0L,
                "category", doc.getDocumentCategory().name()
        ));
    }

    /**
     * Phase 36 — Streaming preview: returns first N bytes of the file for inline preview.
     * Useful for text files, CSV, or small PDFs rendered in-browser.
     */
    @GetMapping("/{documentId}/stream")
    @Operation(summary = "Stream document content for preview",
               description = "Returns the raw file bytes (or first 2KB for large files) with appropriate content-type for inline browser rendering.")
    public ResponseEntity<Resource> streamDocument(
            @PathVariable @Positive Long documentId,
            @RequestParam @NotNull @Positive Long requesterId) {
        Document doc = documentRepository.findById(documentId)
                .filter(d -> !d.isDeleted())
                .orElseThrow(() -> new NoSuchElementException("Document not found: " + documentId));

        try {
            byte[] fileBytes = Files.readAllBytes(Paths.get(doc.getFilePath()));
            // For preview, cap at 1MB to avoid massive payloads
            int previewLength = (int) Math.min(fileBytes.length, 1_048_576L);
            byte[] previewBytes = new byte[previewLength];
            System.arraycopy(fileBytes, 0, previewBytes, 0, previewLength);

            String mime = doc.getMimeType() != null ? doc.getMimeType() : "application/octet-stream";
            String filename = doc.getOriginalFileName() != null ? doc.getOriginalFileName() : doc.getFileName();

            Resource resource = new ByteArrayResource(previewBytes);
            log.info("[PREVIEW_STREAM] doc={} bytes={}", documentId, previewLength);

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(mime))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + filename + "\"")
                    .header("X-Preview-Truncated", String.valueOf(previewLength < fileBytes.length))
                    .header("X-Original-Size", String.valueOf(fileBytes.length))
                    .body(resource);
        } catch (IOException e) {
            log.error("[PREVIEW_STREAM_ERROR] doc={} error={}", documentId, e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Phase 37 — Document format preview: returns a structured format-specific preview descriptor.
     */
    @GetMapping("/{documentId}/format-info")
    @Operation(summary = "Get document format preview info",
               description = "Returns format-specific metadata and preview hints for the document.")
    public ResponseEntity<Map<String, Object>> getFormatPreviewInfo(
            @PathVariable @Positive Long documentId,
            @RequestParam @NotNull @Positive Long requesterId) {
        Document doc = documentRepository.findById(documentId)
                .filter(d -> !d.isDeleted())
                .orElseThrow(() -> new NoSuchElementException("Document not found: " + documentId));

        String mime = doc.getMimeType() != null ? doc.getMimeType() : "application/octet-stream";
        boolean previewable = mime.startsWith("image/") || mime.equals("application/pdf")
                || mime.startsWith("text/");
        boolean textExtractable = doc.getExtractedText() != null && !doc.getExtractedText().isBlank();

        return ResponseEntity.ok(Map.of(
                "documentId", documentId,
                "mimeType", mime,
                "isPreviewable", previewable,
                "hasExtractedText", textExtractable,
                "extractedTextSnippet", textExtractable
                        ? doc.getExtractedText().substring(0, Math.min(300, doc.getExtractedText().length()))
                        : "",
                "fileSize", doc.getFileSize() != null ? doc.getFileSize() : 0L,
                "checksum", doc.getChecksum(),
                "version", doc.getVersion() != null ? doc.getVersion() : 1
        ));
    }
}
