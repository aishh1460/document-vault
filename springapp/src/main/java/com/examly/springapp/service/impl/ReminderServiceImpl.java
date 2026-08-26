package com.examly.springapp.service.impl;

import com.examly.springapp.model.Reminder;
import com.examly.springapp.repository.ReminderRepository;
import com.examly.springapp.service.NotificationService;
import com.examly.springapp.service.ReminderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@Transactional
public class ReminderServiceImpl implements ReminderService {

    private static final Logger log = LoggerFactory.getLogger(ReminderServiceImpl.class);

    private final ReminderRepository reminderRepository;
    private final NotificationService notificationService;

    public ReminderServiceImpl(ReminderRepository reminderRepository, NotificationService notificationService) {
        this.reminderRepository = reminderRepository;
        this.notificationService = notificationService;
    }

    @Override
    public Reminder createReminder(Long documentId, String documentName, Long userId,
                                   LocalDate reminderDate, int daysBefore, String description) {
        Reminder reminder = new Reminder(documentId, documentName, userId, reminderDate, daysBefore, description);
        return reminderRepository.save(reminder);
    }

    /** Simplified constructor — called from ReminderController */
    @Override
    public Reminder createReminder(Long userId, Long documentId, String message, String remindAt) {
        LocalDate date;
        try {
            date = LocalDate.parse(remindAt.substring(0, 10));
        } catch (Exception e) {
            date = LocalDate.now().plusDays(7);
        }
        Reminder reminder = new Reminder(documentId, null, userId, date, 0, message);
        return reminderRepository.save(reminder);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Reminder> getReminders(Long userId) {
        return reminderRepository.findByUserIdOrderByReminderDateAsc(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Reminder> getRemindersByUser(Long userId) {
        return reminderRepository.findByUserIdOrderByReminderDateAsc(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Reminder> getRemindersByDocument(Long documentId) {
        return reminderRepository.findByDocumentId(documentId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Reminder> getActiveReminders(Long userId) {
        return reminderRepository.findByUserIdAndActiveTrueOrderByReminderDateAsc(userId);
    }

    @Override
    public Reminder dismissReminder(Long reminderId) {
        Reminder r = reminderRepository.findById(reminderId)
                .orElseThrow(() -> new NoSuchElementException("Reminder not found: " + reminderId));
        r.setActive(false);
        return reminderRepository.save(r);
    }

    @Override
    public void deleteReminder(Long reminderId) {
        if (!reminderRepository.existsById(reminderId)) {
            throw new NoSuchElementException("Reminder not found: " + reminderId);
        }
        reminderRepository.deleteById(reminderId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Reminder> getDueReminders() {
        return reminderRepository.findByActiveTrueAndReminderDateLessThanEqual(LocalDate.now());
    }

    @Override
    @Scheduled(cron = "0 0 * * * ?")
    public int processDueReminders() {
        LocalDate today = LocalDate.now();
        List<Reminder> dueReminders = reminderRepository.findByActiveTrueAndReminderDateLessThanEqual(today);
        int triggeredCount = 0;
        for (Reminder reminder : dueReminders) {
            String message = (reminder.getDescription() != null && !reminder.getDescription().isBlank())
                    ? reminder.getDescription()
                    : "Reminder for document: " + (reminder.getDocumentName() != null ? reminder.getDocumentName() : "#" + reminder.getDocumentId());
            notificationService.sendNotification(reminder.getUserId(), message, "REMINDER");
            triggeredCount++;
        }
        log.info("[REMINDER_SCHEDULER] Processed {} due reminders for {}", triggeredCount, today);
        return triggeredCount;
    }
}
