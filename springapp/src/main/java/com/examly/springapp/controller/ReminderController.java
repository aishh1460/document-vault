package com.examly.springapp.controller;

import com.examly.springapp.model.Reminder;
import com.examly.springapp.service.ReminderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/reminders")
@Tag(name = "Reminders", description = "Schedule and manage document reminders")
public class ReminderController {

    private final ReminderService reminderService;

    public ReminderController(ReminderService reminderService) {
        this.reminderService = reminderService;
    }

    @PostMapping
    @Operation(summary = "Create reminder", description = "Schedule a new reminder for a document.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Reminder created"),
        @ApiResponse(responseCode = "400", description = "Invalid request")
    })
    public ResponseEntity<Reminder> create(@RequestBody Map<String, Object> body) {
        Long userId = Long.valueOf(body.get("userId").toString());
        Long documentId = body.get("documentId") != null ? Long.valueOf(body.get("documentId").toString()) : null;
        String message = body.getOrDefault("message", "").toString();
        String remindAt = body.get("remindAt").toString();
        Reminder reminder = reminderService.createReminder(userId, documentId, message, remindAt);
        return ResponseEntity.status(HttpStatus.CREATED).body(reminder);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get user reminders", description = "Retrieve all reminders for a user.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Reminders retrieved")
    })
    public ResponseEntity<List<Reminder>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(reminderService.getRemindersByUser(userId));
    }

    @GetMapping("/document/{documentId}")
    @Operation(summary = "Get document reminders", description = "Retrieve all reminders for a specific document.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Reminders retrieved")
    })
    public ResponseEntity<List<Reminder>> getByDocument(@PathVariable Long documentId) {
        return ResponseEntity.ok(reminderService.getRemindersByDocument(documentId));
    }

    @PatchMapping("/{reminderId}/dismiss")
    @Operation(summary = "Dismiss reminder", description = "Mark a reminder as dismissed.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Reminder dismissed"),
        @ApiResponse(responseCode = "404", description = "Reminder not found")
    })
    public ResponseEntity<Reminder> dismiss(@PathVariable Long reminderId) {
        return ResponseEntity.ok(reminderService.dismissReminder(reminderId));
    }

    @DeleteMapping("/{reminderId}")
    @Operation(summary = "Delete reminder", description = "Delete a reminder by ID.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Reminder deleted"),
        @ApiResponse(responseCode = "404", description = "Reminder not found")
    })
    public ResponseEntity<Void> delete(@PathVariable Long reminderId) {
        reminderService.deleteReminder(reminderId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/due")
    @Operation(summary = "Get due reminders", description = "Retrieve active reminders that are due on or before today.")
    public ResponseEntity<List<Reminder>> getDueReminders() {
        return ResponseEntity.ok(reminderService.getDueReminders());
    }

    @PostMapping("/process-due")
    @Operation(summary = "Trigger reminder processing", description = "Manually trigger the reminder scheduler to process due reminders.")
    public ResponseEntity<Map<String, Object>> processDueReminders() {
        int count = reminderService.processDueReminders();
        return ResponseEntity.ok(Map.of(
                "status", "success",
                "processedRemindersCount", count
        ));
    }
}
