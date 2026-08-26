package com.examly.springapp.controller;

import com.examly.springapp.dto.AccessGrantRequest;
import com.examly.springapp.dto.AccessRevokeRequest;
import com.examly.springapp.model.AccessControl;
import com.examly.springapp.service.AccessControlService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/access")
@Validated
@Tag(name = "User Access & Permissions Control", description = "Grant and revoke document permissions, request additional access levels")
public class AccessControlController {

    private final AccessControlService accessControlService;

    public AccessControlController(AccessControlService accessControlService) {
        this.accessControlService = accessControlService;
    }

    @PostMapping("/grant")
    @Operation(summary = "Grant access", description = "Grant document permission level to a user.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Access granted successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid request parameters")
    })
    public ResponseEntity<AccessControl> grantAccess(
            @RequestParam Long granterId,
            @Valid @RequestBody AccessGrantRequest request) {
        AccessControl ac = accessControlService.grantAccess(request, granterId);
        return ResponseEntity.status(HttpStatus.CREATED).body(ac);
    }

    @PostMapping("/revoke")
    @Operation(summary = "Revoke access", description = "Revoke access permission level for a user.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Access revoked successfully")
    })
    public ResponseEntity<Void> revokeAccess(@Valid @RequestBody AccessRevokeRequest request) {
        accessControlService.revokeAccess(request);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/permissions")
    @Operation(summary = "Get permissions matrix", description = "Retrieve all permissions granted to a user.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Permissions matrix returned")
    })
    public ResponseEntity<List<AccessControl>> getPermissionsMatrix(@RequestParam Long userId) {
        List<AccessControl> matrix = accessControlService.getPermissionsMatrix(userId);
        return ResponseEntity.ok(matrix);
    }

    @GetMapping("/document/{documentId}")
    @Operation(summary = "Get document access list", description = "Retrieve all access control grants for a specific document.")
    public ResponseEntity<List<AccessControl>> getDocumentAccessList(
            @PathVariable Long documentId,
            @RequestParam(required = false) Long requesterId) {
        Long rId = (requesterId != null) ? requesterId : 1L;
        return ResponseEntity.ok(accessControlService.getDocumentAccessList(documentId, rId));
    }

    @GetMapping("/review")
    @Operation(summary = "Get access review list", description = "Review all permissions granted across all documents owned by user.")
    public ResponseEntity<List<AccessControl>> getAccessReview(@RequestParam Long ownerId) {
        return ResponseEntity.ok(accessControlService.getAccessReview(ownerId));
    }

    @PostMapping("/cleanup-expired")
    @Operation(summary = "Cleanup expired access grants", description = "Purge all expired permissions from access control table.")
    public ResponseEntity<Map<String, Object>> cleanupExpiredGrants() {
        int cleaned = accessControlService.revokeAllExpiredGrants();
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "revokedExpiredCount", cleaned
        ));
    }
}
