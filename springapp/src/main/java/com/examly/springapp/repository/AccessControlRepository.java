package com.examly.springapp.repository;

import com.examly.springapp.model.AccessControl;
import com.examly.springapp.model.AccessControl.PermissionLevel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AccessControlRepository extends JpaRepository<AccessControl, Long> {

    List<AccessControl> findByDocumentId(Long documentId);

    List<AccessControl> findByUserId(Long userId);

    Page<AccessControl> findByDocumentId(Long documentId, Pageable pageable);

    boolean existsByDocumentIdAndUserId(Long documentId, Long userId);

    @Query("SELECT ac FROM AccessControl ac WHERE ac.documentId = :docId AND ac.userId = :userId")
    List<AccessControl> findByDocumentIdAndUserId(@Param("docId") Long documentId,
                                                   @Param("userId") Long userId);

    @Query("SELECT ac FROM AccessControl ac WHERE ac.expiryDate < :now")
    List<AccessControl> findExpiredAccess(@Param("now") LocalDateTime now);

    @Modifying
    @Query("DELETE FROM AccessControl ac WHERE ac.documentId = :documentId AND ac.userId = :userId")
    void revokeAccess(@Param("documentId") Long documentId, @Param("userId") Long userId);

    @Query("SELECT ac FROM AccessControl ac WHERE ac.userId = :userId AND (ac.expiryDate IS NULL OR ac.expiryDate > :now)")
    List<AccessControl> findActiveAccessByUser(@Param("userId") Long userId,
                                                @Param("now") LocalDateTime now);
}
