package com.examly.springapp.service;

import com.examly.springapp.dto.ShareRequest;
import com.examly.springapp.dto.ShareResponse;
import com.examly.springapp.model.ShareLink;
import org.springframework.http.ResponseEntity;

import java.util.List;

public interface ShareService {
    ShareResponse createShareLink(ShareRequest request, Long createdBy);
    ShareResponse getShareByToken(String token);
    ResponseEntity<byte[]> downloadSharedDocument(String token);
    List<ShareResponse> getSharesByDocument(Long documentId, Long requesterId);
    List<ShareResponse> getSharesByUser(Long userId);
    void revokeShareLink(Long shareId, Long requesterId);
    void revokeByToken(String token, Long requesterId);
}
