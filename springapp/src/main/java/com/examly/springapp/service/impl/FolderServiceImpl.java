package com.examly.springapp.service.impl;

import com.examly.springapp.model.Folder;
import com.examly.springapp.repository.DocumentRepository;
import com.examly.springapp.repository.FolderRepository;
import com.examly.springapp.service.FolderService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.NoSuchElementException;

@Service
@Transactional
public class FolderServiceImpl implements FolderService {

    private static final Logger log = LoggerFactory.getLogger(FolderServiceImpl.class);
    private static final int MAX_FOLDER_DEPTH = 5;

    private final FolderRepository folderRepository;
    private final DocumentRepository documentRepository;

    public FolderServiceImpl(FolderRepository folderRepository,
                             DocumentRepository documentRepository) {
        this.folderRepository = folderRepository;
        this.documentRepository = documentRepository;
    }

    @Override
    public Folder createFolder(String name, Long ownerId, Long parentId) {
        Folder parent = null;
        if (parentId != null) {
            parent = folderRepository.findById(parentId)
                    .orElseThrow(() -> new NoSuchElementException("Parent folder not found: " + parentId));
            if (!parent.getOwnerId().equals(ownerId)) {
                throw new SecurityException("Access denied for parent folder: " + parentId);
            }
            // Phase 31: Depth limit
            int depth = calculateDepth(parent) + 1;
            if (depth >= MAX_FOLDER_DEPTH) {
                throw new IllegalArgumentException("Maximum folder nesting depth of " + MAX_FOLDER_DEPTH + " reached");
            }
        }

        boolean exists = (parent != null)
                ? folderRepository.existsByNameAndOwnerIdAndParent(name, ownerId, parent)
                : folderRepository.existsByNameAndOwnerIdAndParentIsNull(name, ownerId);

        if (exists) {
            throw new IllegalArgumentException("Folder with name '" + name + "' already exists in this location");
        }

        Folder folder = new Folder(name, ownerId, parent);
        Folder saved = folderRepository.save(folder);
        log.info("[FOLDER_CREATE] name='{}' owner={} parent={}", name, ownerId, parentId);
        return saved;
    }

    /** Recursively compute depth (root = 1) */
    private int calculateDepth(Folder folder) {
        int depth = 1;
        Folder current = folder;
        while (current.getParent() != null) {
            depth++;
            current = folderRepository.findById(current.getParent().getId()).orElse(null);
            if (current == null) break;
        }
        return depth;
    }

    @Override
    public Folder renameFolder(Long folderId, String newName, Long ownerId) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new NoSuchElementException("Folder not found: " + folderId));
        if (!folder.getOwnerId().equals(ownerId)) {
            throw new SecurityException("Access denied for folder: " + folderId);
        }
        folder.setName(newName);
        return folderRepository.save(folder);
    }

    @Override
    public void deleteFolder(Long folderId, Long ownerId) {
        Folder folder = folderRepository.findById(folderId)
                .orElseThrow(() -> new NoSuchElementException("Folder not found: " + folderId));
        if (!folder.getOwnerId().equals(ownerId)) {
            throw new SecurityException("Access denied for folder: " + folderId);
        }
        // Phase 31: Safety — refuse to delete if sub-folders exist
        List<Folder> children = folderRepository.findByParent(folder);
        if (!children.isEmpty()) {
            throw new IllegalStateException(
                "Cannot delete folder '" + folder.getName() + "': contains " + children.size() +
                " sub-folder(s). Delete sub-folders first.");
        }
        // Phase 31: Safety — warn if documents reference this folder (log; don't block, documents will become unfoldered)
        long docCount = documentRepository.countByFolderAndDeletedFalse(folder);
        if (docCount > 0) {
            log.warn("[FOLDER_DELETE] Deleting folder id={} with {} documents — they will move to root", folderId, docCount);
        }
        folderRepository.delete(folder);
        log.info("[FOLDER_DELETE] folderId={} owner={}", folderId, ownerId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Folder> getRootFolders(Long ownerId) {
        return folderRepository.findByOwnerIdAndParentIsNull(ownerId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Folder> getAllFolders(Long ownerId) {
        return folderRepository.findByOwnerId(ownerId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Folder> getFoldersByOwner(Long ownerId) {
        return folderRepository.findByOwnerId(ownerId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<Folder> getChildFolders(Long parentId) {
        Folder parent = folderRepository.findById(parentId)
                .orElseThrow(() -> new NoSuchElementException("Folder not found: " + parentId));
        return folderRepository.findByParent(parent);
    }
}
