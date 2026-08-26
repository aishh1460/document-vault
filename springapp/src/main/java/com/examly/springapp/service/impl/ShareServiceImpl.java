package com.examly.springapp.service.impl;

import com.examly.springapp.configuration.CryptoUtils;
import com.examly.springapp.dto.ShareRequest;
import com.examly.springapp.dto.ShareResponse;
import com.examly.springapp.model.Document;
import com.examly.springapp.model.ShareLink;
import com.examly.springapp.repository.DocumentRepository;
import com.examly.springapp.repository.ShareLinkRepository;
import com.examly.springapp.service.DocumentActivityService;
import com.examly.springapp.service.NotificationService;
import com.examly.springapp.service.ShareService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ShareServiceImpl implements ShareService {

    private static final Logger log = LoggerFactory.getLogger(ShareServiceImpl.class);

    private final ShareLinkRepository shareLinkRepository;
    private final DocumentRepository documentRepository;
    private final DocumentActivityService documentActivityService;
    private final NotificationService notificationService;

    public ShareServiceImpl(ShareLinkRepository shareLinkRepository,
                            DocumentRepository documentRepository,
                            DocumentActivityService documentActivityService,
                            NotificationService notificationService) {
        this.shareLinkRepository = shareLinkRepository;
        this.documentRepository = documentRepository;
        this.documentActivityService = documentActivityService;
        this.notificationService = notificationService;
    }

    @Override
    public ShareResponse createShareLink(ShareRequest request, Long createdBy) {
        Document doc = documentRepository.findById(request.getDocumentId())
                .orElseThrow(() -> new NoSuchElementException("Document not found: " + request.getDocumentId()));

        if (!doc.getOwnerId().equals(createdBy)) {
            throw new SecurityException("Only document owner can generate share links");
        }

        LocalDateTime expiryDate = null;
        if (request.getExpiryDays() != null && request.getExpiryDays() > 0) {
            expiryDate = LocalDateTime.now().plusDays(request.getExpiryDays());
        }

        String token = UUID.randomUUID().toString().replace("-", "");
        ShareLink link = new ShareLink(
                doc.getId(),
                createdBy,
                token,
                expiryDate,
                request.getMaxAccess() != null ? request.getMaxAccess() : -1,
                request.getPermissions() != null ? request.getPermissions() : "VIEW",
                LocalDateTime.now()
        );

        ShareLink saved = shareLinkRepository.save(link);
        documentActivityService.logActivity(doc.getId(), doc.getOriginalFileName(), createdBy, "SHARED", "Created share link with permissions: " + saved.getPermissions());
        notificationService.sendNotification(createdBy, "🔗 Secure share link created for " + doc.getOriginalFileName(), "SHARE");

        return ShareResponse.from(saved, doc.getOriginalFileName());
    }

    @Override
    @Transactional(readOnly = true)
    public ShareResponse getShareByToken(String token) {
        ShareLink link = shareLinkRepository.findByAccessToken(token)
                .orElseThrow(() -> new NoSuchElementException("Share link not found or expired"));

        if (!link.isActive()) {
            throw new IllegalStateException("This share link has been revoked or has expired");
        }

        if (link.getExpiryDate() != null && link.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("This share link has expired");
        }

        if (link.getMaxAccess() > 0 && link.getAccessCount() >= link.getMaxAccess()) {
            throw new IllegalStateException("This share link has reached its maximum access limit");
        }

        Document doc = documentRepository.findById(link.getDocumentId())
                .orElseThrow(() -> new NoSuchElementException("Shared document no longer exists"));

        return ShareResponse.from(link, doc.getOriginalFileName());
    }

    @Override
    public ResponseEntity<byte[]> downloadSharedDocument(String token) {
        ShareLink link = shareLinkRepository.findByAccessToken(token)
                .orElseThrow(() -> new NoSuchElementException("Share link not found"));

        if (!link.isActive()) {
            throw new IllegalStateException("Share link is revoked or inactive");
        }

        if (link.getExpiryDate() != null && link.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Share link has expired");
        }

        if (link.getMaxAccess() > 0 && link.getAccessCount() >= link.getMaxAccess()) {
            throw new IllegalStateException("Share link has exceeded maximum access count");
        }

        Document doc = documentRepository.findById(link.getDocumentId())
                .orElseThrow(() -> new NoSuchElementException("Document not found"));

        // Increment access count
        link.setAccessCount(link.getAccessCount() + 1);
        if (link.getMaxAccess() > 0 && link.getAccessCount() >= link.getMaxAccess()) {
            link.setActive(false);
        }
        shareLinkRepository.save(link);

        documentActivityService.logActivity(doc.getId(), doc.getOriginalFileName(), link.getCreatedBy(), "SHARE_DOWNLOAD", "Document downloaded via public share link");

        try {
            byte[] rawContent = Files.readAllBytes(Paths.get(doc.getFilePath()));
            byte[] content;
            try {
                content = CryptoUtils.decrypt(rawContent, doc.getEncryptionKeyId());
            } catch (Exception e) {
                content = rawContent;
            }

            String mimeType = doc.getMimeType() != null ? doc.getMimeType() : "application/octet-stream";
            String filename = doc.getOriginalFileName() != null ? doc.getOriginalFileName() : doc.getFileName();

            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(mimeType))
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                    .body(content);
        } catch (IOException e) {
            throw new IllegalStateException("Failed to read shared document: " + doc.getId(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShareResponse> getSharesByDocument(Long documentId, Long requesterId) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new NoSuchElementException("Document not found: " + documentId));

        if (!doc.getOwnerId().equals(requesterId)) {
            throw new SecurityException("Access denied");
        }

        return shareLinkRepository.findByDocumentIdAndActiveTrue(documentId).stream()
                .map(link -> ShareResponse.from(link, doc.getOriginalFileName()))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShareResponse> getSharesByUser(Long userId) {
        return shareLinkRepository.findByCreatedByAndActiveTrue(userId).stream()
                .map(link -> {
                    String title = documentRepository.findById(link.getDocumentId())
                            .map(Document::getOriginalFileName)
                            .orElse("Document #" + link.getDocumentId());
                    return ShareResponse.from(link, title);
                })
                .collect(Collectors.toList());
    }

    @Override
    public void revokeShareLink(Long shareId, Long requesterId) {
        ShareLink link = shareLinkRepository.findById(shareId)
                .orElseThrow(() -> new NoSuchElementException("Share link not found: " + shareId));

        if (!link.getCreatedBy().equals(requesterId)) {
            throw new SecurityException("Only creator can revoke this link");
        }

        link.setActive(false);
        shareLinkRepository.save(link);
    }

    @Override
    public void revokeByToken(String token, Long requesterId) {
        ShareLink link = shareLinkRepository.findByAccessToken(token)
                .orElseThrow(() -> new NoSuchElementException("Share link not found"));

        if (!link.getCreatedBy().equals(requesterId)) {
            throw new SecurityException("Only creator can revoke this link");
        }

        link.setActive(false);
        shareLinkRepository.save(link);
    }
}
