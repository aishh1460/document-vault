package com.examly.springapp.controller;

import com.examly.springapp.service.BackupService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Map;

@RestController
@RequestMapping("/api/backup")
@Tag(name = "Backup & Recovery", description = "Backup vault data and restore state")
public class BackupController {

    private final BackupService backupService;

    public BackupController(BackupService backupService) {
        this.backupService = backupService;
    }

    @GetMapping("/export")
    @Operation(summary = "Export backup archive", description = "Export all vault documents and metadata into a ZIP backup.")
    public ResponseEntity<byte[]> exportBackup(@RequestParam(required = false) Long requesterId) {
        Long rId = (requesterId != null) ? requesterId : 1L;
        byte[] backupZip = backupService.exportBackup(rId);
        String timestamp = LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss"));
        String filename = "vault_backup_" + timestamp + ".zip";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .contentType(MediaType.APPLICATION_OCTET_STREAM)
                .body(backupZip);
    }

    @PostMapping(value = "/restore", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Restore from backup archive", description = "Restore documents from an exported backup ZIP archive.")
    public ResponseEntity<Map<String, Object>> restoreBackup(
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) Long requesterId) {
        Long rId = (requesterId != null) ? requesterId : 1L;
        Map<String, Object> result = backupService.restoreBackup(file, rId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/status")
    @Operation(summary = "Get backup status and statistics")
    public ResponseEntity<Map<String, Object>> getBackupStatus() {
        return ResponseEntity.ok(backupService.getBackupStatus());
    }
}
