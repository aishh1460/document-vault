package com.examly.springapp.model;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "document_activities")
public class DocumentActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long documentId;
    private String documentName;
    private Long userId;
    private String username;
    private String action;
    private String details;
    private LocalDateTime timestamp = LocalDateTime.now();

    public DocumentActivity() {}

    public DocumentActivity(Long documentId, String documentName, Long userId, String username, String action, String details) {
        this.documentId = documentId;
        this.documentName = documentName;
        this.userId = userId;
        this.username = username;
        this.action = action;
        this.details = details;
        this.timestamp = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }
    public String getDocumentName() { return documentName; }
    public void setDocumentName(String documentName) { this.documentName = documentName; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getAction() { return action; }
    public void setAction(String action) { this.action = action; }
    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}
