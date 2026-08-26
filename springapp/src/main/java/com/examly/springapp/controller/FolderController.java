package com.examly.springapp.controller;

import com.examly.springapp.model.Folder;
import com.examly.springapp.service.FolderService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/folders")
@Validated
@Tag(name = "Folder Management", description = "Create, list, rename, and delete document folders")
public class FolderController {

    private final FolderService folderService;

    public FolderController(FolderService folderService) {
        this.folderService = folderService;
    }

    @PostMapping
    @Operation(summary = "Create folder", description = "Create a new folder for the given owner.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Folder created"),
        @ApiResponse(responseCode = "400", description = "Invalid request")
    })
    public ResponseEntity<Folder> createFolder(
            @RequestParam Long ownerId,
            @RequestParam String name,
            @RequestParam(required = false) Long parentId) {
        Folder folder = folderService.createFolder(name, ownerId, parentId);
        return ResponseEntity.status(HttpStatus.CREATED).body(folder);
    }

    @GetMapping("/user/{ownerId}")
    @Operation(summary = "Get user folders", description = "List all root-level folders owned by a user.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Folders retrieved")
    })
    public ResponseEntity<List<Folder>> getFoldersByOwner(@PathVariable Long ownerId) {
        List<Folder> folders = folderService.getFoldersByOwner(ownerId);
        return ResponseEntity.ok(folders);
    }

    @GetMapping("/{folderId}/children")
    @Operation(summary = "Get sub-folders", description = "List child folders within a given parent folder.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Children retrieved"),
        @ApiResponse(responseCode = "404", description = "Folder not found")
    })
    public ResponseEntity<List<Folder>> getChildren(@PathVariable Long folderId) {
        List<Folder> children = folderService.getChildFolders(folderId);
        return ResponseEntity.ok(children);
    }

    @PatchMapping("/{folderId}/rename")
    @Operation(summary = "Rename folder", description = "Rename an existing folder.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Folder renamed"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Folder not found")
    })
    public ResponseEntity<Folder> renameFolder(
            @PathVariable Long folderId,
            @RequestParam Long ownerId,
            @RequestBody Map<String, String> body) {
        Folder folder = folderService.renameFolder(folderId, body.get("name"), ownerId);
        return ResponseEntity.ok(folder);
    }

    @DeleteMapping("/{folderId}")
    @Operation(summary = "Delete folder", description = "Permanently delete a folder.")
    @ApiResponses({
        @ApiResponse(responseCode = "204", description = "Folder deleted"),
        @ApiResponse(responseCode = "403", description = "Access denied"),
        @ApiResponse(responseCode = "404", description = "Folder not found")
    })
    public ResponseEntity<Void> deleteFolder(@PathVariable Long folderId, @RequestParam Long ownerId) {
        folderService.deleteFolder(folderId, ownerId);
        return ResponseEntity.noContent().build();
    }
}
