package com.examly.springapp.controller;

import com.examly.springapp.model.DigitalSignature;
import com.examly.springapp.service.DigitalSignatureService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/signatures")
@Validated
@Tag(name = "Digital Signatures", description = "Sign documents, validate, and verify integrity")
public class DigitalSignatureController {

    private final DigitalSignatureService signatureService;

    public DigitalSignatureController(DigitalSignatureService signatureService) {
        this.signatureService = signatureService;
    }

    @PostMapping
    @Operation(summary = "Sign a document", description = "Create a digital signature record for a document")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Signature created"),
        @ApiResponse(responseCode = "404", description = "Document not found")
    })
    public ResponseEntity<DigitalSignature> signDocument(
            @RequestParam @NotNull @Positive Long documentId,
            @RequestParam @NotNull @Positive Long signerId,
            @RequestParam(required = false) String signatureData,
            @RequestParam(required = false) String certificateId) {
        DigitalSignature sig = signatureService.signDocument(documentId, signerId, signatureData, certificateId);
        return ResponseEntity.status(HttpStatus.CREATED).body(sig);
    }

    @GetMapping("/document/{documentId}")
    @Operation(summary = "Get all signatures for a document")
    public ResponseEntity<List<DigitalSignature>> getSignaturesForDocument(
            @PathVariable @Positive Long documentId) {
        return ResponseEntity.ok(signatureService.getSignaturesForDocument(documentId));
    }

    @GetMapping("/signer/{signerId}")
    @Operation(summary = "Get all signatures by a signer")
    public ResponseEntity<List<DigitalSignature>> getSignaturesBySigner(
            @PathVariable @Positive Long signerId) {
        return ResponseEntity.ok(signatureService.getSignaturesBySigner(signerId));
    }

    @GetMapping("/document/{documentId}/status")
    @Operation(summary = "Check if a document is signed")
    public ResponseEntity<Map<String, Object>> isDocumentSigned(
            @PathVariable @Positive Long documentId) {
        boolean isSigned = signatureService.isDocumentSigned(documentId);
        return ResponseEntity.ok(Map.of(
                "documentId", documentId,
                "isSigned", isSigned,
                "status", isSigned ? "SIGNED" : "UNSIGNED"
        ));
    }

    @PatchMapping("/{signatureId}/validate")
    @Operation(summary = "Validate a signature record")
    public ResponseEntity<DigitalSignature> validateSignature(
            @PathVariable @Positive Long signatureId) {
        return ResponseEntity.ok(signatureService.validateSignature(signatureId));
    }

    @DeleteMapping("/{signatureId}")
    @Operation(summary = "Revoke a signature")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Signature revoked"),
        @ApiResponse(responseCode = "403", description = "Not permitted to revoke")
    })
    public ResponseEntity<Void> revokeSignature(
            @PathVariable @Positive Long signatureId,
            @RequestParam @NotNull @Positive Long requesterId) {
        signatureService.revokeSignature(signatureId, requesterId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/document/{documentId}/integrity")
    @Operation(summary = "Verify document integrity via checksum and signature",
               description = "Recomputes the stored file's SHA-256 and compares with the persisted checksum. Also reports signature status.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Integrity report returned"),
        @ApiResponse(responseCode = "404", description = "Document not found")
    })
    public ResponseEntity<Map<String, Object>> verifyDocumentIntegrity(
            @PathVariable @Positive Long documentId,
            @RequestParam @NotNull @Positive Long requesterId) {
        return ResponseEntity.ok(signatureService.verifyDocumentIntegrity(documentId, requesterId));
    }
}
