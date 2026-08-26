package com.examly.springapp.repository;

import com.examly.springapp.model.DocumentVersion;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DocumentVersionRepository extends JpaRepository<DocumentVersion, Long> {

    Page<DocumentVersion> findByDocumentIdOrderByVersionNumberDesc(Long documentId, Pageable pageable);

    @Query("SELECT MAX(dv.versionNumber) FROM DocumentVersion dv WHERE dv.documentId = :documentId")
    Optional<Integer> findMaxVersionNumber(@Param("documentId") Long documentId);

    Optional<DocumentVersion> findByDocumentIdAndVersionNumber(Long documentId, Integer versionNumber);
}
