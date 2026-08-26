package com.examly.springapp.service;

import org.springframework.web.multipart.MultipartFile;
import java.util.Map;

public interface BackupService {
    byte[] exportBackup(Long requesterId);
    Map<String, Object> restoreBackup(MultipartFile file, Long requesterId);
    Map<String, Object> getBackupStatus();
}
