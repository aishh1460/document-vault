package com.examly.springapp.controller;

import com.examly.springapp.dto.DocumentSummaryResponse;
import com.examly.springapp.service.DocumentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/favorites")
@Tag(name = "Favorites", description = "Manage starred/favourite documents")
public class FavoriteController {

    private final DocumentService documentService;

    public FavoriteController(DocumentService documentService) {
        this.documentService = documentService;
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get favourite documents", description = "Retrieve all documents marked as favourite by a user.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Favourites retrieved")
    })
    public ResponseEntity<Page<DocumentSummaryResponse>> getFavorites(
            @PathVariable Long userId,
            Pageable pageable) {
        return ResponseEntity.ok(documentService.getFavoriteDocuments(userId, pageable));
    }

    @PatchMapping("/{documentId}/toggle")
    @Operation(summary = "Toggle favourite", description = "Star or unstar a document as favourite.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Favourite toggled"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Document not found")
    })
    public ResponseEntity<com.examly.springapp.dto.DocumentResponse> toggleFavorite(
            @PathVariable Long documentId,
            @RequestParam Long requesterId) {
        return ResponseEntity.ok(documentService.toggleFavorite(documentId, requesterId));
    }
}
