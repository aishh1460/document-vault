package com.examly.springapp.service;

import com.examly.springapp.model.Notification;
import java.util.List;

public interface NotificationService {
    Notification sendNotification(Long userId, String message, String type);
    List<Notification> getNotifications(Long userId);
    /** Alias for getNotifications — used by NotificationController */
    List<Notification> getNotificationsByUser(Long userId);
    List<Notification> getUnreadNotifications(Long userId);
    /** Returns the updated Notification entity */
    Notification markAsRead(Long notificationId);
    void markAllAsRead(Long userId);
    void deleteNotification(Long notificationId);
}
