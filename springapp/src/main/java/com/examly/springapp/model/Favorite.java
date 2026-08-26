package com.examly.springapp.model;

import javax.persistence.*;

@Entity
@Table(
    name = "favorites",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"userId", "documentId"})
    }
)
public class Favorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long userId;

    @Column(nullable = false)
    private Long documentId;

    public Favorite() {}

    public Favorite(Long userId, Long documentId) {
        this.userId = userId;
        this.documentId = documentId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }
}
