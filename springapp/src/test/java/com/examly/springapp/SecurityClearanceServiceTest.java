package com.examly.springapp;

import com.examly.springapp.model.Document.SecurityClassification;
import com.examly.springapp.service.impl.SecurityClearanceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class SecurityClearanceServiceTest {

    private SecurityClearanceServiceImpl clearanceService;

    @BeforeEach
    void setUp() {
        clearanceService = new SecurityClearanceServiceImpl();
    }

    @Test
    void testPublicAccessAlwaysAllowed() {
        assertTrue(clearanceService.hasRequiredClearance(1L, SecurityClassification.PUBLIC));
    }

    @Test
    void testDefaultClearanceIsInternal() {
        assertEquals(SecurityClassification.INTERNAL, clearanceService.getUserClearanceLevel(1L));
        assertTrue(clearanceService.hasRequiredClearance(1L, SecurityClassification.INTERNAL));
        assertFalse(clearanceService.hasRequiredClearance(1L, SecurityClassification.CONFIDENTIAL));
    }

    @Test
    void testGrantAndRevokeClearance() {
        clearanceService.grantClearance(2L, SecurityClassification.TOP_SECRET);
        assertEquals(SecurityClassification.TOP_SECRET, clearanceService.getUserClearanceLevel(2L));
        assertTrue(clearanceService.hasRequiredClearance(2L, SecurityClassification.CONFIDENTIAL));
        assertTrue(clearanceService.hasRequiredClearance(2L, SecurityClassification.RESTRICTED));
        assertTrue(clearanceService.hasRequiredClearance(2L, SecurityClassification.TOP_SECRET));

        clearanceService.revokeClearance(2L);
        assertEquals(SecurityClassification.INTERNAL, clearanceService.getUserClearanceLevel(2L));
        assertFalse(clearanceService.hasRequiredClearance(2L, SecurityClassification.TOP_SECRET));
    }

    @Test
    void testAssertClearanceThrowsSecurityException() {
        assertThrows(SecurityException.class, () ->
                clearanceService.assertClearance(3L, SecurityClassification.RESTRICTED));
    }
}
