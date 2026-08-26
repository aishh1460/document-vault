package com.examly.springapp.service;

import org.springframework.web.multipart.MultipartFile;
import java.util.concurrent.CompletableFuture;

public interface OcrService {

    /**
     * Synchronously extract text from a multipart file.
     */
    String extractText(MultipartFile file);

    /**
     * Synchronously extract text from raw byte content.
     */
    String extractTextFromBytes(byte[] content, String filename, String mimeType);

    /**
     * Asynchronously process and update OCR extracted text for an existing document.
     */
    CompletableFuture<String> processDocumentOcrAsync(Long documentId);
}
