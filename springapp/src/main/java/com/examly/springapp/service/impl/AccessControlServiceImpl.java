package com.examly.springapp.service.impl;

import com.examly.springapp.dto.AccessGrantRequest;
import com.examly.springapp.dto.AccessRevokeRequest;
import com.examly.springapp.model.AccessControl;
import com.examly.springapp.model.AccessControl.PermissionLevel;
import com.examly.springapp.model.AccessControl.AccessType;
import com.examly.springapp.model.Document;
import com.examly.springapp.repository.AccessControlRepository;
import com.examly.springapp.repository.DocumentRepository;
import com.examly.springapp.service.AccessControlService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.NoSuchElementException;

@Service
@Transactional
public class AccessControlServiceImpl implements AccessControlService {

    private static final Logger log = LoggerFactory.getLogger(AccessControlServiceImpl.class);

    private final AccessControlRepository accessControlRepository;
    private final DocumentRepository documentRepository;

    public AccessControlServiceImpl(AccessControlRepository accessControlRepository,
                                    DocumentRepository documentRepository) {
        this.accessControlRepository = accessControlRepository;
        this.documentRepository = documentRepository;
    }

    @Override
    public AccessControl grantAccess(AccessGrantRequest request, Long granterId) {
        AccessControl ac = new AccessControl(
                request.getDocumentId(),
                request.getUserId(),
                PermissionLevel.valueOf(request.getPermissionLevel().toUpperCase()),
                AccessType.valueOf(request.getAccessType().toUpperCase()),
                granterId,
                LocalDateTime.now(),
                request.getExpiryDate()
        );
        ac.setConditions(request.getConditions());
        return accessControlRepository.save(ac);
    }

    @Override
    public void revokeAccess(AccessRevokeRequest request) {
        accessControlRepository.revokeAccess(request.getDocumentId(), request.getUserId());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AccessControl> getPermissionsMatrix(Long userId) {
        return accessControlRepository.findByUserId(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasAccess(Long documentId, Long userId, PermissionLevel requiredLevel) {
        if (documentId == null || userId == null) return false;
        Document doc = documentRepository.findById(documentId).orElse(null);
        if (doc == null || doc.isDeleted()) return false;

        // Owner has full access
        if (userId.equals(doc.getOwnerId())) return true;

        List<AccessControl> grants = accessControlRepository.findByDocumentIdAndUserId(documentId, userId);
        LocalDateTime now = LocalDateTime.now();
        for (AccessControl grant : grants) {
            if (grant.getExpiryDate() != null && grant.getExpiryDate().isBefore(now)) {
                continue; // expired grant
            }
            if (grant.getPermissionLevel() == PermissionLevel.ADMIN) return true;
            if (requiredLevel == PermissionLevel.VIEW) return true;
            if (grant.getPermissionLevel() == requiredLevel) return true;
            if (grant.getPermissionLevel() == PermissionLevel.EDIT && (requiredLevel == PermissionLevel.VIEW || requiredLevel == PermissionLevel.COMMENT)) return true;
        }
        return false;
    }

    @Override
    @Transactional(readOnly = true)
    public void checkAccess(Long documentId, Long userId, PermissionLevel requiredLevel) {
        if (!hasAccess(documentId, userId, requiredLevel)) {
            throw new SecurityException("Access denied: User " + userId + " lacks " + requiredLevel + " permission for document " + documentId);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<AccessControl> getDocumentAccessList(Long documentId, Long requesterId) {
        Document doc = documentRepository.findById(documentId)
                .orElseThrow(() -> new NoSuchElementException("Document not found: " + documentId));
        if (!doc.getOwnerId().equals(requesterId) && !hasAccess(documentId, requesterId, PermissionLevel.ADMIN)) {
            throw new SecurityException("Access denied to view access list for document: " + documentId);
        }
        return accessControlRepository.findByDocumentId(documentId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AccessControl> getAccessReview(Long ownerId) {
        List<Document> userDocs = documentRepository.findByOwnerIdAndDeletedFalse(ownerId);
        List<AccessControl> reviewList = new ArrayList<>();
        for (Document doc : userDocs) {
            reviewList.addAll(accessControlRepository.findByDocumentId(doc.getId()));
        }
        return reviewList;
    }

    @Override
    public int revokeAllExpiredGrants() {
        LocalDateTime now = LocalDateTime.now();
        List<AccessControl> expired = accessControlRepository.findExpiredAccess(now);
        for (AccessControl ac : expired) {
            accessControlRepository.delete(ac);
        }
        log.info("[ACCESS_EXPIRE] Cleaned up {} expired access grants", expired.size());
        return expired.size();
    }
}

