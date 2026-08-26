package com.examly.springapp.service;

import com.examly.springapp.model.Document.SecurityClassification;

/**
 * Phase 32 — Security Clearance
 * Enforces classification-level gating: a user must have a clearance level
 * equal to or higher than the document's classification to access it.
 */
public interface SecurityClearanceService {

    /**
     * Check if a user has sufficient clearance to access a document at the given classification.
     * Public documents are always accessible.
     * For other levels the user must have been granted clearance via the system.
     */
    boolean hasRequiredClearance(Long userId, SecurityClassification requiredClassification);

    /**
     * Assert clearance — throws SecurityException if the user lacks clearance.
     */
    void assertClearance(Long userId, SecurityClassification requiredClassification);

    /**
     * Grant clearance to a user up to the specified level.
     * Only admins should invoke this.
     */
    void grantClearance(Long userId, SecurityClassification level);

    /**
     * Revoke a user's clearance.
     */
    void revokeClearance(Long userId);

    /**
     * Get the current clearance level of a user.
     */
    SecurityClassification getUserClearanceLevel(Long userId);
}
