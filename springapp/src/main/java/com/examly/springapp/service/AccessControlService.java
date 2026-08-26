package com.examly.springapp.service;

import com.examly.springapp.dto.AccessGrantRequest;
import com.examly.springapp.dto.AccessRevokeRequest;
import com.examly.springapp.model.AccessControl;
import com.examly.springapp.model.AccessControl.PermissionLevel;

import java.util.List;

public interface AccessControlService {
    AccessControl grantAccess(AccessGrantRequest request, Long granterId);
    void revokeAccess(AccessRevokeRequest request);
    List<AccessControl> getPermissionsMatrix(Long userId);
    boolean hasAccess(Long documentId, Long userId, PermissionLevel requiredLevel);
    void checkAccess(Long documentId, Long userId, PermissionLevel requiredLevel);
    List<AccessControl> getDocumentAccessList(Long documentId, Long requesterId);
    List<AccessControl> getAccessReview(Long ownerId);
    int revokeAllExpiredGrants();
}

