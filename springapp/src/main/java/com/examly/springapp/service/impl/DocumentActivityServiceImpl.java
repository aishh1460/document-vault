package com.examly.springapp.service.impl;

import com.examly.springapp.model.DocumentActivity;
import com.examly.springapp.model.User;
import com.examly.springapp.repository.DocumentActivityRepository;
import com.examly.springapp.repository.UserRepository;
import com.examly.springapp.service.DocumentActivityService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class DocumentActivityServiceImpl implements DocumentActivityService {

    private final DocumentActivityRepository documentActivityRepository;
    private final UserRepository userRepository;

    public DocumentActivityServiceImpl(DocumentActivityRepository documentActivityRepository, UserRepository userRepository) {
        this.documentActivityRepository = documentActivityRepository;
        this.userRepository = userRepository;
    }

    @Override
    public DocumentActivity logActivity(Long documentId, String documentName, Long userId, String action, String details) {
        String username = "System";
        if (userId != null) {
            username = userRepository.findById(userId)
                    .map(User::getUsername)
                    .orElse("User " + userId);
        }
        DocumentActivity activity = new DocumentActivity(documentId, documentName, userId, username, action, details);
        return documentActivityRepository.save(activity);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentActivity> getRecentActivities(Long userId) {
        return documentActivityRepository.findTop15ByUserIdOrderByTimestampDesc(userId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentActivity> getAllRecentActivities() {
        return documentActivityRepository.findTop15ByOrderByTimestampDesc();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DocumentActivity> getDocumentActivities(Long documentId) {
        return documentActivityRepository.findByDocumentIdOrderByTimestampDesc(documentId);
    }
}
