package com.examly.springapp.service.impl;

import com.examly.springapp.model.Document.SecurityClassification;
import com.examly.springapp.service.SecurityClearanceService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Phase 32 — Security Clearance Service Implementation
 *
 * Maintains an in-memory clearance registry.
 * Classification levels are ordered by ordinal (PUBLIC=0 < TOP_SECRET=4).
 * A user with level X can access documents up to level X.
 *
 * Default clearance for all users: INTERNAL.
 * Admins may use the grant/revoke API to adjust this.
 */
@Service
public class SecurityClearanceServiceImpl implements SecurityClearanceService {

    private static final Logger log = LoggerFactory.getLogger(SecurityClearanceServiceImpl.class);

    // userId -> max clearance level
    private final Map<Long, SecurityClassification> clearanceRegistry = new ConcurrentHashMap<>();

    // Default clearance for users not explicitly registered
    private static final SecurityClassification DEFAULT_CLEARANCE = SecurityClassification.INTERNAL;

    @Override
    public boolean hasRequiredClearance(Long userId, SecurityClassification required) {
        if (required == null || required == SecurityClassification.PUBLIC) return true;
        SecurityClassification userLevel = clearanceRegistry.getOrDefault(userId, DEFAULT_CLEARANCE);
        return userLevel.ordinal() >= required.ordinal();
    }

    @Override
    public void assertClearance(Long userId, SecurityClassification required) {
        if (!hasRequiredClearance(userId, required)) {
            SecurityClassification userLevel = clearanceRegistry.getOrDefault(userId, DEFAULT_CLEARANCE);
            throw new SecurityException(
                String.format("Clearance denied: document requires %s but user %d has clearance %s",
                    required, userId, userLevel));
        }
    }

    @Override
    public void grantClearance(Long userId, SecurityClassification level) {
        clearanceRegistry.put(userId, level);
        log.info("[CLEARANCE_GRANT] userId={} -> level={}", userId, level);
    }

    @Override
    public void revokeClearance(Long userId) {
        clearanceRegistry.remove(userId);
        log.info("[CLEARANCE_REVOKE] userId={}", userId);
    }

    @Override
    public SecurityClassification getUserClearanceLevel(Long userId) {
        return clearanceRegistry.getOrDefault(userId, DEFAULT_CLEARANCE);
    }
}
