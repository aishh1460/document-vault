package com.examly.springapp.service;

import com.examly.springapp.model.Reminder;
import java.time.LocalDate;
import java.util.List;

public interface ReminderService {
    Reminder createReminder(Long documentId, String documentName, Long userId, LocalDate reminderDate, int daysBefore, String description);
    /** Simplified create used by ReminderController */
    Reminder createReminder(Long userId, Long documentId, String message, String remindAt);
    List<Reminder> getReminders(Long userId);
    /** Alias used by ReminderController */
    List<Reminder> getRemindersByUser(Long userId);
    /** Used by ReminderController */
    List<Reminder> getRemindersByDocument(Long documentId);
    List<Reminder> getActiveReminders(Long userId);
    /** Returns updated Reminder entity */
    Reminder dismissReminder(Long reminderId);
    void deleteReminder(Long reminderId);
    List<Reminder> getDueReminders();
    int processDueReminders();
}
