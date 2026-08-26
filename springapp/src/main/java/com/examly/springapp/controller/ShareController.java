package com.examly.springapp.controller;

import com.examly.springapp.dto.ShareRequest;
import com.examly.springapp.dto.ShareResponse;
import com.examly.springapp.service.ShareService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import java.util.List;

@RestController
@RequestMapping("/api/shares")
@Validated
@Tag(name = "Secure Sharing", description = "Generate and manage time-limited, password-protected or view-only document share links")
public class ShareController {

    private final ShareService shareService;

    public ShareController(ShareService shareService) {
        this.shareService = shareService;
    }

    @PostMapping("/create")
    @Operation(summary = "Create share link", description = "Generate a secure access token link for sharing a document with external viewers.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Share link created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid share parameters"),
        @ApiResponse(responseCode = "404", description = "Document not found")
    })
    public ResponseEntity<ShareResponse> createShareLink(
            @RequestParam @NotNull @Positive Long requesterId,
            @Valid @RequestBody ShareRequest request) {
        ShareResponse response = shareService.createShareLink(request, requesterId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/token/{token}")
    @Operation(summary = "Get share link info", description = "Fetch shared document information using the secure access token.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Share details retrieved"),
        @ApiResponse(responseCode = "404", description = "Share link not found or expired"),
        @ApiResponse(responseCode = "409", description = "Share link has expired or reached limit")
    })
    public ResponseEntity<ShareResponse> getShareByToken(@PathVariable String token) {
        return ResponseEntity.ok(shareService.getShareByToken(token));
    }

    @GetMapping("/download/{token}")
    @Operation(summary = "Download shared document", description = "Download the document file via valid share link token.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "File download stream"),
        @ApiResponse(responseCode = "404", description = "Link not found"),
        @ApiResponse(responseCode = "409", description = "Link expired or access limit reached")
    })
    public ResponseEntity<byte[]> downloadSharedDocument(@PathVariable String token) {
        return shareService.downloadSharedDocument(token);
    }

    @GetMapping("/document/{documentId}")
    @Operation(summary = "Get shares for document", description = "Retrieve all active share links created for a specific document.")
    public ResponseEntity<List<ShareResponse>> getSharesByDocument(
            @PathVariable @Positive Long documentId,
            @RequestParam @NotNull @Positive Long requesterId) {
        return ResponseEntity.ok(shareService.getSharesByDocument(documentId, requesterId));
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user share links", description = "Retrieve all active share links created by the given user.")
    public ResponseEntity<List<ShareResponse>> getSharesByUser(@PathVariable @Positive Long userId) {
        return ResponseEntity.ok(shareService.getSharesByUser(userId));
    }

    @DeleteMapping("/{shareId}")
    @Operation(summary = "Revoke share link", description = "Deactivate a share link so it can no longer be accessed.")
    public ResponseEntity<Void> revokeShareLink(
            @PathVariable @Positive Long shareId,
            @RequestParam @NotNull @Positive Long requesterId) {
        shareService.revokeShareLink(shareId, requesterId);
        return ResponseEntity.noContent().build();
    }
}
