package com.examly.springapp.service;

import com.examly.springapp.model.DigitalSignature;
import com.examly.springapp.model.DigitalSignature.ValidationStatus;

import java.util.List;
import java.util.Map;

public interface DigitalSignatureService {

    /** Sign a document — generates a signature record for the given signer */
    DigitalSignature signDocument(Long documentId, Long signerId, String signatureData, String certificateId);

    /** Validate an existing signature record */
    DigitalSignature validateSignature(Long signatureId);

    /** Revoke an existing signature record */
    void revokeSignature(Long signatureId, Long requesterId);

    /** Get all signatures for a document */
    List<DigitalSignature> getSignaturesForDocument(Long documentId);

    /** Get all signatures by a specific signer */
    List<DigitalSignature> getSignaturesBySigner(Long signerId);

    /** Check if a document has at least one valid, non-expired signature */
    boolean isDocumentSigned(Long documentId);

    /** Compute a canonical SHA-256 digest of the stored document file and compare with signature data */
    Map<String, Object> verifyDocumentIntegrity(Long documentId, Long requesterId);
}
