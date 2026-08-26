package com.examly.springapp.repository;

import com.examly.springapp.model.DigitalSignature;
import com.examly.springapp.model.DigitalSignature.ValidationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DigitalSignatureRepository extends JpaRepository<DigitalSignature, Long> {

    List<DigitalSignature> findByDocumentId(Long documentId);

    List<DigitalSignature> findBySignerId(Long signerId);

    List<DigitalSignature> findByValidationStatus(ValidationStatus status);

    boolean existsByDocumentIdAndSignerId(Long documentId, Long signerId);

    @Modifying
    @Query("UPDATE DigitalSignature ds SET ds.validationStatus = :status WHERE ds.id = :id")
    void updateValidationStatus(@Param("id") Long id, @Param("status") ValidationStatus status);

    @Query("SELECT ds FROM DigitalSignature ds WHERE ds.documentId = :docId AND ds.validationStatus = 'VALID'")
    List<DigitalSignature> findValidSignaturesForDocument(@Param("docId") Long documentId);
}
