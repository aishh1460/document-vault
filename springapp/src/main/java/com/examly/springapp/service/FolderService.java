package com.examly.springapp.service;

import com.examly.springapp.model.Folder;
import java.util.List;

public interface FolderService {
    Folder createFolder(String name, Long ownerId, Long parentId);
    Folder renameFolder(Long folderId, String newName, Long ownerId);
    void deleteFolder(Long folderId, Long ownerId);
    List<Folder> getRootFolders(Long ownerId);
    List<Folder> getAllFolders(Long ownerId);
    /** Alias used by FolderController */
    List<Folder> getFoldersByOwner(Long ownerId);
    /** Alias used by FolderController */
    List<Folder> getChildFolders(Long parentId);
}
