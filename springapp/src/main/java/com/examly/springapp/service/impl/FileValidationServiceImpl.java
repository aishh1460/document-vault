package com.examly.springapp.service.impl;

import com.examly.springapp.service.FileValidationService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

/**
 * Centralized file validation implementation.
 * All validation rules are in one place — used by upload and version upload flows.
 */
@Service
public class FileValidationServiceImpl implements FileValidationService {

    private static final long MAX_FILE_SIZE = 100 * 1024 * 1024L; // 100 MB

    private static final Set<String> ALLOWED_MIME = new HashSet<>(Arrays.asList(
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            "application/vnd.ms-excel",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            "image/jpeg",
            "image/png",
            "image/tiff",
            "text/plain",
            "text/csv"
    ));

    @Override
    public void validate(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File must not be empty");
        }
        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException(
                    "File size " + (file.getSize() / (1024 * 1024)) + "MB exceeds the 100MB limit");
        }
        String mime = file.getContentType();
        if (mime == null || !ALLOWED_MIME.contains(mime)) {
            throw new IllegalArgumentException(
                    "Unsupported file type: " + mime +
                    ". Allowed types: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, TIFF, TXT, CSV");
        }
    }
}
