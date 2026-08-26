package com.examly.springapp.service;

import com.examly.springapp.model.DocumentActivity;
import java.util.List;

public interface DocumentActivityService {
    DocumentActivity logActivity(Long documentId, String documentName, Long userId, String action, String details);
    List<DocumentActivity> getRecentActivities(Long userId);
    List<DocumentActivity> getAllRecentActivities();
    List<DocumentActivity> getDocumentActivities(Long documentId);
}
