package com.examly.springapp.repository;

import com.examly.springapp.model.ShareLink;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ShareLinkRepository extends JpaRepository<ShareLink, Long> {

    Optional<ShareLink> findByAccessToken(String accessToken);

    List<ShareLink> findByDocumentIdAndActiveTrue(Long documentId);

    List<ShareLink> findByCreatedByAndActiveTrue(Long createdBy);

    @Modifying
    @Query("UPDATE ShareLink sl SET sl.active = false WHERE sl.accessToken = :token")
    void revokeByToken(@Param("token") String token);

    @Modifying
    @Query("UPDATE ShareLink sl SET sl.active = false WHERE sl.documentId = :documentId")
    void revokeAllForDocument(@Param("documentId") Long documentId);

    @Modifying
    @Query("UPDATE ShareLink sl SET sl.accessCount = sl.accessCount + 1 WHERE sl.id = :id")
    void incrementAccessCount(@Param("id") Long id);

    @Query("SELECT sl FROM ShareLink sl WHERE sl.active = true AND (sl.expiryDate IS NULL OR sl.expiryDate > :now)")
    List<ShareLink> findActiveNonExpired(@Param("now") LocalDateTime now);

    @Modifying
    @Query("UPDATE ShareLink sl SET sl.active = false WHERE sl.expiryDate < :now")
    void expireOldLinks(@Param("now") LocalDateTime now);

    boolean existsByAccessToken(String accessToken);
}
