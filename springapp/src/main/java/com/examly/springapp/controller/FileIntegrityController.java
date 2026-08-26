package com.examly.springapp.controller;

import com.examly.springapp.service.FileIntegrityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.Positive;
import java.util.Map;

@RestController
@RequestMapping("/api/integrity")
@Validated
@Tag(name = "File Integrity", description = "Verify file checksums and run vault-wide integrity scans")
public class FileIntegrityController {

    private final FileIntegrityService fileIntegrityService;

    public FileIntegrityController(FileIntegrityService fileIntegrityService) {
        this.fileIntegrityService = fileIntegrityService;
    }

    @GetMapping("/document/{documentId}")
    @Operation(summary = "Verify integrity of a single document",
               description = "Recomputes SHA-256 of stored file and compares against persisted checksum.")
    public ResponseEntity<Map<String, Object>> verifyDocument(
            @PathVariable @Positive Long documentId) {
        return ResponseEntity.ok(fileIntegrityService.verifyDocument(documentId));
    }

    @PostMapping("/scan")
    @Operation(summary = "Run a full vault integrity scan",
               description = "Scans all active documents, recomputes their checksums, and reports violations.")
    public ResponseEntity<Map<String, Object>> runScan() {
        return ResponseEntity.ok(fileIntegrityService.runIntegrityScan());
    }
}
