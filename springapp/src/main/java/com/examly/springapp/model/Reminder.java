package com.examly.springapp.model;

import javax.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reminders")
public class Reminder {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long documentId;

    private String documentName;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private LocalDate reminderDate;

    private int daysBefore = 7;

    private String description;

    private boolean active = true;

    private LocalDateTime createdAt = LocalDateTime.now();

    public Reminder() {}

    public Reminder(Long documentId, String documentName, Long userId, LocalDate reminderDate, int daysBefore, String description) {
        this.documentId = documentId;
        this.documentName = documentName;
        this.userId = userId;
        this.reminderDate = reminderDate;
        this.daysBefore = daysBefore;
        this.description = description;
        this.active = true;
        this.createdAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }
    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public LocalDate getReminderDate() { return reminderDate; }
    public void setReminderDate(LocalDate reminderDate) { this.reminderDate = reminderDate; }
    public int getDaysBefore() { return daysBefore; }
    public void setDaysBefore(int daysBefore) { this.daysBefore = daysBefore; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public boolean isActive() { return active; }
    public void setActive(boolean active) { this.active = active; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
