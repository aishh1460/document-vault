package com.examly.springapp.controller;

import com.examly.springapp.model.Notification;
import com.examly.springapp.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notifications", description = "Manage in-app notifications for users")
public class NotificationController {

    private final NotificationService notificationService;

    public NotificationController(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get all notifications", description = "Retrieve all notifications for a user.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Notifications retrieved")
    })
    public ResponseEntity<List<Notification>> getNotifications(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getNotificationsByUser(userId));
    }

    @GetMapping("/user/{userId}/unread")
    @Operation(summary = "Get unread notifications", description = "Retrieve only unread notifications for a user.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Unread notifications retrieved")
    })
    public ResponseEntity<List<Notification>> getUnread(@PathVariable Long userId) {
        return ResponseEntity.ok(notificationService.getUnreadNotifications(userId));
    }

    @PatchMapping("/{notificationId}/read")
    @Operation(summary = "Mark as read", description = "Mark a single notification as read.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Marked as read"),
        @ApiResponse(responseCode = "404", description = "Notification not found")
    })
    public ResponseEntity<Notification> markAsRead(@PathVariable Long notificationId) {
        return ResponseEntity.ok(notificationService.markAsRead(notificationId));
    }

    @PatchMapping("/user/{userId}/read-all")
    @Operation(summary = "Mark all as read", description = "Mark all notifications for a user as read.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "All notifications marked as read")
    })
    public ResponseEntity<Void> markAllRead(@PathVariable Long userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{notificationId}")
    @Operation(summary = "Delete notification", description = "Delete a notification by ID.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Notification deleted"),
        @ApiResponse(responseCode = "404", description = "Notification not found")
    })
    public ResponseEntity<Void> delete(@PathVariable Long notificationId) {
        notificationService.deleteNotification(notificationId);
        return ResponseEntity.noContent().build();
    }
}
