package com.examly.springapp.service;

import java.util.Map;

/**
 * Phase 38 — File Integrity Service
 * Verifies stored files match their recorded checksums.
 */
public interface FileIntegrityService {

    /** Verify a single document's file integrity. Returns a result map. */
    Map<String, Object> verifyDocument(Long documentId);

    /** Run a full vault-wide integrity scan. Returns summary with counts. */
    Map<String, Object> runIntegrityScan();

    /** Scheduled: auto-run integrity scan daily and log results. */
    void scheduledIntegrityScan();
}
