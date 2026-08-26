package com.examly.springapp.controller;

import com.examly.springapp.model.Tag;
import com.examly.springapp.repository.TagRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/tags")
@io.swagger.v3.oas.annotations.tags.Tag(name = "Tags & Categories", description = "Tag documents for easy grouping and filtering")
public class TagController {

    private final TagRepository tagRepository;

    public TagController(TagRepository tagRepository) {
        this.tagRepository = tagRepository;
    }

    @GetMapping
    @Operation(summary = "Get all tags", description = "Retrieve all tags available in the vault.")
    @ApiResponses({
        @ApiResponse(responseCode = "200", description = "Tags list returned")
    })
    public ResponseEntity<List<Tag>> getAllTags() {
        return ResponseEntity.ok(tagRepository.findAll());
    }

    @PostMapping
    @Operation(summary = "Create tag", description = "Create a new tag if not already existing.")
    @ApiResponses({
        @ApiResponse(responseCode = "201", description = "Tag created"),
        @ApiResponse(responseCode = "200", description = "Tag already exists")
    })
    public ResponseEntity<Tag> createTag(@RequestBody Map<String, String> body) {
        String name = body.getOrDefault("name", "").trim().toLowerCase();
        if (name.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return tagRepository.findByName(name)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.CREATED).body(tagRepository.save(new Tag(name))));
    }

    @PatchMapping("/{id}")
    @Operation(summary = "Rename tag", description = "Update the name of an existing tag.")
    public ResponseEntity<Tag> renameTag(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newName = body.getOrDefault("name", "").trim().toLowerCase();
        if (newName.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        return tagRepository.findById(id)
                .map(tag -> {
                    tag.setName(newName);
                    return ResponseEntity.ok(tagRepository.save(tag));
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete tag", description = "Remove a tag from the system.")
    public ResponseEntity<Void> deleteTag(@PathVariable Long id) {
        if (!tagRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        tagRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
