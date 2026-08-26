package com.examly.springapp.controller;

import com.examly.springapp.model.Document;
import com.examly.springapp.model.Document.DocumentCategory;
import com.examly.springapp.model.Document.DocumentStatus;
import com.examly.springapp.model.Document.SecurityClassification;
import com.examly.springapp.model.Reminder;
import com.examly.springapp.repository.AccessControlRepository;
import com.examly.springapp.repository.DocumentRepository;
import com.examly.springapp.repository.FolderRepository;
import com.examly.springapp.repository.NotificationRepository;
import com.examly.springapp.repository.ReminderRepository;
import com.examly.springapp.repository.ShareLinkRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Phase 33 & 34 — Vault Health and Dashboard Performance
 * Enhanced dashboard with detailed health report, category breakdown, and
 * pre-aggregated query results to avoid N+1 issues.
 */
@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "Dashboard & Analytics", description = "Aggregated statistics and vault health indicators")
public class DashboardController {

    private final DocumentRepository documentRepository;
    private final FolderRepository folderRepository;
    private final ShareLinkRepository shareLinkRepository;
    private final NotificationRepository notificationRepository;
    private final ReminderRepository reminderRepository;
    private final AccessControlRepository accessControlRepository;

    public DashboardController(DocumentRepository documentRepository,
                               FolderRepository folderRepository,
                               ShareLinkRepository shareLinkRepository,
                               NotificationRepository notificationRepository,
                               ReminderRepository reminderRepository,
                               AccessControlRepository accessControlRepository) {
        this.documentRepository = documentRepository;
        this.folderRepository = folderRepository;
        this.shareLinkRepository = shareLinkRepository;
        this.notificationRepository = notificationRepository;
        this.reminderRepository = reminderRepository;
        this.accessControlRepository = accessControlRepository;
    }

    @GetMapping("/stats")
    @Operation(summary = "Get vault statistics",
               description = "Calculates total documents, storage used, favorites, folders, shares, and vault health score.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Dashboard stats retrieved")
    })
    public ResponseEntity<Map<String, Object>> getDashboardStats(@RequestParam Long userId) {
        Specification<Document> activeDocsSpec = (root, query, cb) -> cb.and(
                cb.equal(root.get("ownerId"), userId),
                cb.isFalse(root.get("deleted"))
        );
        List<Document> activeDocs = documentRepository.findAll(activeDocsSpec);

        long totalDocuments = activeDocs.size();
        long storageUsedBytes = activeDocs.stream().mapToLong(d -> d.getFileSize() != null ? d.getFileSize() : 0L).sum();
        long favoriteCount = activeDocs.stream().filter(Document::isFavorite).count();
        long folderCount = folderRepository.findByOwnerIdAndParentIsNull(userId).size();
        long shareCount = shareLinkRepository.findByCreatedByAndActiveTrue(userId).size();
        long unreadNotifications = notificationRepository.countByUserIdAndIsReadFalse(userId);

        Specification<Document> trashSpec = (root, query, cb) -> cb.and(
                cb.equal(root.get("ownerId"), userId),
                cb.isTrue(root.get("deleted"))
        );
        long trashCount = documentRepository.count(trashSpec);

        List<Reminder> activeReminders = reminderRepository.findByUserIdAndActiveTrueOrderByReminderDateAsc(userId);
        long attentionRequired = activeReminders.size();

        // Phase 34 Performance: Pre-aggregate category counts in a single pass
        Map<String, Long> byCategory = activeDocs.stream()
                .collect(Collectors.groupingBy(d -> d.getDocumentCategory().name(), Collectors.counting()));

        // Phase 34 Performance: status breakdown in a single pass
        Map<String, Long> byStatus = activeDocs.stream()
                .collect(Collectors.groupingBy(d -> d.getStatus().name(), Collectors.counting()));

        // Phase 34 Performance: expired docs count
        long expiredCount = byStatus.getOrDefault(DocumentStatus.EXPIRED.name(), 0L);

        // Phase 33 Vault Health Score (out of 100)
        int healthScore = 100;
        if (totalDocuments == 0) healthScore = 85;
        if (attentionRequired > 0) healthScore -= Math.min(20, (int) attentionRequired * 5);
        if (trashCount > 5) healthScore -= 5;
        if (storageUsedBytes > 8L * 1024 * 1024 * 1024) healthScore -= 10;
        if (expiredCount > 0) healthScore -= Math.min(15, (int) expiredCount * 3);
        healthScore = Math.max(50, Math.min(100, healthScore));

        // Phase 33: Health classification
        String healthStatus;
        if (healthScore >= 90) healthStatus = "EXCELLENT";
        else if (healthScore >= 75) healthStatus = "GOOD";
        else if (healthScore >= 60) healthStatus = "FAIR";
        else healthStatus = "NEEDS_ATTENTION";

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalDocuments", totalDocuments);
        stats.put("storageUsedBytes", storageUsedBytes);
        stats.put("storageUsedMb", String.format("%.2f", storageUsedBytes / (1024.0 * 1024.0)));
        stats.put("totalFolders", folderCount);
        stats.put("totalFavorites", favoriteCount);
        stats.put("totalShared", shareCount);
        stats.put("trashCount", trashCount);
        stats.put("expiredCount", expiredCount);
        stats.put("unreadNotifications", unreadNotifications);
        stats.put("attentionRequired", attentionRequired);
        stats.put("vaultHealthScore", healthScore);
        stats.put("vaultHealthStatus", healthStatus);
        stats.put("documentsByCategory", byCategory);
        stats.put("documentsByStatus", byStatus);

        return ResponseEntity.ok(stats);
    }

    /**
     * Phase 33 — Standalone vault health report
     */
    @GetMapping("/health")
    @Operation(summary = "Get detailed vault health report",
               description = "Returns comprehensive health indicators: storage, expiry, trash, sharing, and overall score.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Health report returned")
    })
    public ResponseEntity<Map<String, Object>> getVaultHealth(@RequestParam Long userId) {
        List<Document> allDocs = documentRepository.findByOwnerIdAndDeletedFalse(userId);

        long totalSize = allDocs.stream().mapToLong(d -> d.getFileSize() != null ? d.getFileSize() : 0L).sum();
        long expiredCount = allDocs.stream()
                .filter(d -> d.getStatus() == DocumentStatus.EXPIRED).count();
        long noRetentionDateCount = allDocs.stream()
                .filter(d -> d.getRetentionDate() == null).count();
        long archivedCount = allDocs.stream()
                .filter(d -> d.getStatus() == DocumentStatus.ARCHIVED).count();
        long trashCount = documentRepository.findByOwnerIdAndDeletedTrue(userId).size();
        long dueForRenewal = allDocs.stream()
                .filter(d -> d.getRetentionDate() != null
                        && d.getRetentionDate().isAfter(LocalDate.now())
                        && d.getRetentionDate().isBefore(LocalDate.now().plusDays(30))).count();

        int score = 100;
        if (expiredCount > 0) score -= Math.min(30, (int)(expiredCount * 5));
        if (trashCount > 3) score -= 5;
        if (noRetentionDateCount > 5) score -= 10;
        if (totalSize > 5L * 1024 * 1024 * 1024) score -= 10;
        score = Math.max(30, Math.min(100, score));

        String grade;
        if (score >= 90) grade = "A";
        else if (score >= 80) grade = "B";
        else if (score >= 70) grade = "C";
        else if (score >= 60) grade = "D";
        else grade = "F";

        Map<String, Object> health = new LinkedHashMap<>();
        health.put("userId", userId);
        health.put("totalDocuments", allDocs.size());
        health.put("totalStorageBytes", totalSize);
        health.put("totalStorageMb", String.format("%.2f", totalSize / (1024.0 * 1024.0)));
        health.put("expiredDocuments", expiredCount);
        health.put("archivedDocuments", archivedCount);
        health.put("trashDocuments", trashCount);
        health.put("documentsWithoutRetentionDate", noRetentionDateCount);
        health.put("documentsDueForRenewal", dueForRenewal);
        health.put("healthScore", score);
        health.put("healthGrade", grade);
        health.put("checkedAt", LocalDate.now().toString());

        return ResponseEntity.ok(health);
    }
}
