package com.examly.springapp.service;

import org.springframework.web.multipart.MultipartFile;

/**
 * Centralized file validation service.
 * Used by all upload flows to enforce consistent rules.
 */
public interface FileValidationService {

    /**
     * Validate file for upload.
     * @throws IllegalArgumentException if validation fails
     */
    void validate(MultipartFile file);
}
