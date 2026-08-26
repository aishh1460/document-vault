package com.examly.springapp.controller;

import com.examly.springapp.model.Document;
import com.examly.springapp.repository.DocumentRepository;
import com.examly.springapp.service.OcrService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.NoSuchElementException;

@RestController
@RequestMapping("/api/ocr")
@Tag(name = "OCR", description = "Extract text from uploaded document images and documents")
public class OcrController {

    private final OcrService ocrService;
    private final DocumentRepository documentRepository;

    public OcrController(OcrService ocrService, DocumentRepository documentRepository) {
        this.ocrService = ocrService;
        this.documentRepository = documentRepository;
    }

    @PostMapping("/extract")
    @Operation(
        summary = "Extract text from file",
        description = "Upload an image or PDF and receive the extracted text content via OCR."
    )
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Text extracted successfully"),
        @ApiResponse(responseCode = "400", description = "Unsupported file format or empty file"),
        @ApiResponse(responseCode = "500", description = "OCR processing error")
    })
    public ResponseEntity<Map<String, String>> extractText(@RequestParam("file") MultipartFile file) {
        try {
            String text = ocrService.extractText(file);
            return ResponseEntity.ok(Map.of("extractedText", text, "status", "success"));
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body(Map.of("extractedText", "", "status", "error", "message", e.getMessage()));
        }
    }

    @GetMapping("/document/{documentId}")
    @Operation(summary = "Get OCR text for an existing document")
    public ResponseEntity<Map<String, Object>> getDocumentOcr(@PathVariable Long documentId) {
        Document doc = documentRepository.findById(documentId)
                .filter(d -> !d.isDeleted())
                .orElseThrow(() -> new NoSuchElementException("Document not found: " + documentId));

        String text = doc.getExtractedText() != null ? doc.getExtractedText() : "";
        return ResponseEntity.ok(Map.of(
                "documentId", documentId,
                "extractedText", text,
                "status", "success"
        ));
    }

    @PostMapping("/document/{documentId}/process")
    @Operation(summary = "Trigger async OCR processing for an existing document")
    public ResponseEntity<Map<String, Object>> processDocumentOcrAsync(@PathVariable Long documentId) {
        Document doc = documentRepository.findById(documentId)
                .filter(d -> !d.isDeleted())
                .orElseThrow(() -> new NoSuchElementException("Document not found: " + documentId));

        ocrService.processDocumentOcrAsync(documentId);

        return ResponseEntity.status(HttpStatus.ACCEPTED).body(Map.of(
                "documentId", documentId,
                "status", "PROCESSING",
                "message", "OCR text extraction initiated asynchronously"
        ));
    }
}
