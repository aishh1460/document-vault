package com.examly.springapp.model;

import javax.persistence.*;
import java.time.LocalDateTime;


@Entity
@Table(
    name = "digital_signatures",
    indexes = {
        @Index(name = "idx_ds_document", columnList = "documentId"),
        @Index(name = "idx_ds_signer",   columnList = "signerId")
    }
)
public class DigitalSignature {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long documentId;

    @Column(nullable = false)
    private Long signerId;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String signatureData;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(length = 128)
    private String certificateId;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ValidationStatus validationStatus;



    public DigitalSignature() {}

    public DigitalSignature(Long documentId, Long signerId, String signatureData,
                            LocalDateTime timestamp, String certificateId,
                            ValidationStatus validationStatus) {
        this.documentId = documentId;
        this.signerId = signerId;
        this.signatureData = signatureData;
        this.timestamp = timestamp;
        this.certificateId = certificateId;
        this.validationStatus = validationStatus;
    }


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getDocumentId() { return documentId; }
    public void setDocumentId(Long documentId) { this.documentId = documentId; }

    public Long getSignerId() { return signerId; }
    public void setSignerId(Long signerId) { this.signerId = signerId; }

    public String getSignatureData() { return signatureData; }
    public void setSignatureData(String signatureData) { this.signatureData = signatureData; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public String getCertificateId() { return certificateId; }
    public void setCertificateId(String certificateId) { this.certificateId = certificateId; }

    public ValidationStatus getValidationStatus() { return validationStatus; }
    public void setValidationStatus(ValidationStatus validationStatus) { this.validationStatus = validationStatus; }

    public enum ValidationStatus {
        VALID, INVALID, EXPIRED, REVOKED, PENDING_VALIDATION
    }
}
