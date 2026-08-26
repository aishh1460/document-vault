package com.examly.springapp.controller;

import com.examly.springapp.model.DocumentActivity;
import com.examly.springapp.service.DocumentActivityService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/activity")
@Tag(name = "Recent Activity", description = "Track document events and user actions")
public class DocumentActivityController {

    private final DocumentActivityService activityService;

    public DocumentActivityController(DocumentActivityService activityService) {
        this.activityService = activityService;
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user activity log", description = "Retrieve recent document activities and interactions for a user.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Activities retrieved")
    })
    public ResponseEntity<List<DocumentActivity>> getUserActivities(@PathVariable Long userId) {
        return ResponseEntity.ok(activityService.getRecentActivities(userId));
    }

    @GetMapping("/recent")
    @Operation(summary = "Get system recent activities", description = "Retrieve global recent document activities (for admins).")
    public ResponseEntity<List<DocumentActivity>> getRecentActivities() {
        return ResponseEntity.ok(activityService.getAllRecentActivities());
    }

    @GetMapping("/document/{documentId}")
    @Operation(summary = "Get document activity log", description = "Retrieve all activities for a specific document.")
    public ResponseEntity<List<DocumentActivity>> getDocumentActivities(@PathVariable Long documentId) {
        return ResponseEntity.ok(activityService.getDocumentActivities(documentId));
    }
}
