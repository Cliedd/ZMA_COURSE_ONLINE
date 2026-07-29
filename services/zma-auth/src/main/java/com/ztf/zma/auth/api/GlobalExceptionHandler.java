package com.ztf.zma.auth.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;

import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, Object>> handleResponseStatusException(ResponseStatusException ex) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        String reason = ex.getReason() != null ? ex.getReason() : status.getReasonPhrase();
        return ResponseEntity.status(status).body(Map.of(
            "timestamp", Instant.now().toString(),
            "status",    status.value(),
            "error",     status.getReasonPhrase(),
            "message",   reason
        ));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        HttpStatus status = resolveStatus(ex.getMessage());
        return ResponseEntity.status(status).body(Map.of(
            "timestamp", Instant.now().toString(),
            "status",    status.value(),
            "error",     status.getReasonPhrase(),
            "message",   ex.getMessage() != null ? ex.getMessage() : "Unexpected error"
        ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidationException(
            MethodArgumentNotValidException ex) {

        Map<String, String> fieldErrors = ex.getBindingResult().getFieldErrors().stream()
            .collect(Collectors.toMap(
                FieldError::getField,
                fe -> fe.getDefaultMessage() != null ? fe.getDefaultMessage() : "invalid",
                (a, b) -> a
            ));

        return ResponseEntity.badRequest().body(Map.of(
            "timestamp", Instant.now().toString(),
            "status",    400,
            "error",     "Validation Failed",
            "fields",    fieldErrors
        ));
    }

    private HttpStatus resolveStatus(String message) {
        if (message == null) return HttpStatus.INTERNAL_SERVER_ERROR;
        if (message.contains("Too many")) return HttpStatus.TOO_MANY_REQUESTS;
        return switch (message) {
            case "User not found",
                 "Course not found",
                 "Enrollment not found"                   -> HttpStatus.NOT_FOUND;
            case "Invalid credentials",
                 "Invalid or expired refresh token",
                 "Invalid or expired reset token",
                 "Invalid or expired verification token",
                 "Invalid or expired MFA challenge",
                 "Invalid MFA code",
                 "Account is suspended"                   -> HttpStatus.UNAUTHORIZED;
            case "Email already in use"                   -> HttpStatus.CONFLICT;
            case "Please log in with Google"              -> HttpStatus.BAD_REQUEST;
            default                                       -> HttpStatus.BAD_REQUEST;
        };
    }
}
