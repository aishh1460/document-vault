package com.examly.springapp.controller;

import com.examly.springapp.model.Document.SecurityClassification;
import com.examly.springapp.service.SecurityClearanceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import javax.validation.constraints.NotNull;
import javax.validation.constraints.Positive;
import java.util.Map;

@RestController
@RequestMapping("/api/clearance")
@Validated
@Tag(name = "Security Clearance", description = "Manage user security classification clearance levels")
public class SecurityClearanceController {

    private final SecurityClearanceService clearanceService;

    public SecurityClearanceController(SecurityClearanceService clearanceService) {
        this.clearanceService = clearanceService;
    }

    @GetMapping("/{userId}")
    @Operation(summary = "Get a user's current clearance level")
    public ResponseEntity<Map<String, Object>> getClearance(
            @PathVariable @Positive Long userId) {
        SecurityClassification level = clearanceService.getUserClearanceLevel(userId);
        return ResponseEntity.ok(Map.of(
                "userId", userId,
                "clearanceLevel", level.name(),
                "ordinal", level.ordinal()
        ));
    }

    @PutMapping("/{userId}/grant")
    @Operation(summary = "Grant clearance level to a user (admin only)")
    public ResponseEntity<Map<String, Object>> grantClearance(
            @PathVariable @Positive Long userId,
            @RequestParam @NotNull SecurityClassification level) {
        clearanceService.grantClearance(userId, level);
        return ResponseEntity.ok(Map.of(
                "userId", userId,
                "grantedLevel", level.name(),
                "status", "granted"
        ));
    }

    @DeleteMapping("/{userId}/revoke")
    @Operation(summary = "Revoke user clearance (resets to default INTERNAL)")
    public ResponseEntity<Map<String, Object>> revokeClearance(
            @PathVariable @Positive Long userId) {
        clearanceService.revokeClearance(userId);
        return ResponseEntity.ok(Map.of(
                "userId", userId,
                "status", "revoked",
                "resetTo", "INTERNAL"
        ));
    }

    @GetMapping("/{userId}/check")
    @Operation(summary = "Check if a user has sufficient clearance for a given classification")
    public ResponseEntity<Map<String, Object>> checkClearance(
            @PathVariable @Positive Long userId,
            @RequestParam @NotNull SecurityClassification requiredLevel) {
        boolean allowed = clearanceService.hasRequiredClearance(userId, requiredLevel);
        SecurityClassification userLevel = clearanceService.getUserClearanceLevel(userId);
        return ResponseEntity.ok(Map.of(
                "userId", userId,
                "userClearance", userLevel.name(),
                "requiredLevel", requiredLevel.name(),
                "hasAccess", allowed
        ));
    }
}
