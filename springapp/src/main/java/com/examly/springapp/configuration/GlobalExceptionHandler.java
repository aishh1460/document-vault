package com.examly.springapp.configuration;

import com.examly.springapp.exception.DuplicateDocumentException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

import javax.validation.ConstraintViolationException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.NoSuchElementException;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    private Map<String, Object> buildError(HttpStatus status, String error, String message) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", LocalDateTime.now().toString());
        body.put("status", status.value());
        body.put("error", error);
        body.put("message", message);
        return body;
    }

    /** Validation failures from @Valid / @RequestBody */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        Map<String, String> fieldErrors = new HashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            String humanMsg;
            if ("password".equals(fe.getField())) {
                humanMsg = "Password must be at least 8 characters";
            } else if ("username".equals(fe.getField())) {
                humanMsg = "Username must be between 3 and 50 characters";
            } else if ("email".equals(fe.getField())) {
                humanMsg = "A valid email address is required";
            } else {
                humanMsg = fe.getDefaultMessage();
            }
            fieldErrors.put(fe.getField(), humanMsg);
        }
        Map<String, Object> body = buildError(HttpStatus.BAD_REQUEST, "Validation Failed", "One or more fields are invalid");
        body.put("fieldErrors", fieldErrors);
        return ResponseEntity.badRequest().body(body);
    }

    /** Constraint violations from path variables / request params */
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<Map<String, Object>> handleConstraint(ConstraintViolationException ex) {
        return ResponseEntity.badRequest()
                .body(buildError(HttpStatus.BAD_REQUEST, "Constraint Violation", ex.getMessage()));
    }

    /** Business rule violations */
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArg(IllegalArgumentException ex) {
        return ResponseEntity.badRequest()
                .body(buildError(HttpStatus.BAD_REQUEST, "Bad Request", ex.getMessage()));
    }

    /** Resource not found */
    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(NoSuchElementException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(buildError(HttpStatus.NOT_FOUND, "Not Found", ex.getMessage()));
    }

    /** Access control violations */
    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<Map<String, Object>> handleSecurity(SecurityException ex) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(buildError(HttpStatus.FORBIDDEN, "Access Denied", ex.getMessage()));
    }

    /** Duplicate document detected — return 409 with existing document ID */
    @ExceptionHandler(DuplicateDocumentException.class)
    public ResponseEntity<Map<String, Object>> handleDuplicate(DuplicateDocumentException ex) {
        Map<String, Object> body = buildError(HttpStatus.CONFLICT, "Duplicate Document", ex.getMessage());
        body.put("existingDocumentId", ex.getExistingDocumentId());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(body);
    }

    /** State violations (inactive account, etc.) */
    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException ex) {
        return ResponseEntity.status(HttpStatus.CONFLICT)
                .body(buildError(HttpStatus.CONFLICT, "Conflict", ex.getMessage()));
    }

    /** File size exceeded */
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> handleMaxSize(MaxUploadSizeExceededException ex) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                .body(buildError(HttpStatus.PAYLOAD_TOO_LARGE, "File Too Large", "Uploaded file exceeds the 100MB maximum allowed size"));
    }

    /** Catch-all */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleAll(Exception ex) {
        log.error("Unhandled exception: ", ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(buildError(HttpStatus.INTERNAL_SERVER_ERROR, "Internal Server Error",
                        "An unexpected error occurred. Please try again later."));
    }
}
