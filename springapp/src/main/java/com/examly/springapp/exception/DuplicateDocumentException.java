package com.examly.springapp.exception;

/**
 * Thrown when a document with the same content checksum already exists in the vault.
 * Carries the ID of the existing document so the client can offer a "create version" flow.
 */
public class DuplicateDocumentException extends RuntimeException {

    private final Long existingDocumentId;

    public DuplicateDocumentException(Long existingDocumentId) {
        super("Duplicate document detected. This file already exists in your vault.");
        this.existingDocumentId = existingDocumentId;
    }

    public Long getExistingDocumentId() {
        return existingDocumentId;
    }
}
