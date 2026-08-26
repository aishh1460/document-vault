package com.examly.springapp.repository;

import com.examly.springapp.model.Document;
import com.examly.springapp.model.Document.DocumentCategory;
import com.examly.springapp.model.Document.DocumentStatus;
import com.examly.springapp.model.Folder;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentRepository
        extends JpaRepository<Document, Long>, JpaSpecificationExecutor<Document> {

    Page<Document> findByOwnerIdAndDeletedFalse(Long ownerId, Pageable pageable);

    List<Document> findByOwnerIdAndDeletedFalse(Long ownerId);

    Page<Document> findByStatusAndDeletedFalse(DocumentStatus status, Pageable pageable);

    Page<Document> findByOwnerIdAndStatusAndDeletedFalse(Long ownerId, DocumentStatus status, Pageable pageable);

    Page<Document> findByDocumentCategoryAndDeletedFalse(DocumentCategory category, Pageable pageable);

    Page<Document> findByOwnerIdAndDocumentCategoryAndDeletedFalse(Long ownerId, DocumentCategory category, Pageable pageable);

    Optional<Document> findByFileNameAndDeletedFalse(String fileName);

    Page<Document> findByFileNameContainingIgnoreCaseAndDeletedFalse(String fileName, Pageable pageable);

    Page<Document> findByOriginalFileNameContainingIgnoreCaseAndDeletedFalse(String originalFileName, Pageable pageable);

    Optional<Document> findByChecksumAndDeletedFalse(String checksum);

    boolean existsByChecksumAndDeletedFalse(String checksum);

    @Query("SELECT d FROM Document d WHERE d.status = 'ACTIVE' AND d.deleted = false")
    Page<Document> findAllActive(Pageable pageable);

    @Query("SELECT d FROM Document d WHERE d.ownerId = :ownerId AND d.status = 'ACTIVE' AND d.deleted = false")
    Page<Document> findActiveByOwner(@Param("ownerId") Long ownerId, Pageable pageable);


    @Query("SELECT d FROM Document d WHERE d.deleted = false" +
           " AND (LOWER(d.fileName) LIKE LOWER(CONCAT('%', :q, '%'))" +
           " OR LOWER(d.originalFileName) LIKE LOWER(CONCAT('%', :q, '%'))" +
           " OR LOWER(d.extractedText) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Document> search(@Param("q") String query, Pageable pageable);

    @Query("SELECT d FROM Document d WHERE d.ownerId = :ownerId AND d.deleted = false" +
           " AND (LOWER(d.fileName) LIKE LOWER(CONCAT('%', :q, '%'))" +
           " OR LOWER(d.originalFileName) LIKE LOWER(CONCAT('%', :q, '%'))" +
           " OR LOWER(d.extractedText) LIKE LOWER(CONCAT('%', :q, '%')))")
    Page<Document> searchByOwner(@Param("ownerId") Long ownerId, @Param("q") String query, Pageable pageable);

    @Query("SELECT d FROM Document d WHERE d.retentionDate <= :date AND d.deleted = false")
    List<Document> findExpiredRetention(@Param("date") LocalDate date);

    @Query("SELECT d FROM Document d WHERE d.ownerId = :ownerId AND d.retentionDate <= :date AND d.deleted = false")
    List<Document> findExpiredRetentionByOwner(@Param("ownerId") Long ownerId, @Param("date") LocalDate date);

    @Query("SELECT d FROM Document d WHERE d.archiveDate <= :date AND d.status <> 'ARCHIVED' AND d.deleted = false")
    List<Document> findDueForArchive(@Param("date") LocalDate date);

    @Modifying
    @Query("UPDATE Document d SET d.deleted = true WHERE d.id = :id")
    void softDeleteById(@Param("id") Long id);

    @Modifying
    @Query("UPDATE Document d SET d.deleted = true WHERE d.ownerId = :ownerId")
    void softDeleteAllByOwner(@Param("ownerId") Long ownerId);
    boolean existsByIdAndDeletedFalse(Long id);

    boolean existsByIdAndOwnerIdAndDeletedFalse(Long id, Long ownerId);

    List<Document> findByDeletedTrue();

    List<Document> findByOwnerIdAndDeletedTrue(Long ownerId);

    List<Document> findByDeletedTrueAndUpdatedAtBefore(java.time.LocalDateTime cutoff);

    /** Phase 31: count docs in a folder (for safety check before folder deletion) */
    long countByFolderAndDeletedFalse(Folder folder);
}
