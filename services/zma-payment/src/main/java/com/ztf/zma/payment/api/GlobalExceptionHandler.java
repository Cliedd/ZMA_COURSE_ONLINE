package com.ztf.zma.payment.api;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> handleRuntimeException(RuntimeException ex) {
        HttpStatus status = resolveStatus(ex.getMessage());
        return ResponseEntity.status(status).body(Map.of(
                "timestamp", Instant.now().toString(),
                "status", status.value(),
                "message", ex.getMessage() != null ? ex.getMessage() : "Internal error"
        ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(e -> e.getField() + ": " + e.getDefaultMessage())
                .collect(Collectors.joining(", "));
        return ResponseEntity.status(HttpStatus.UNPROCESSABLE_ENTITY).body(Map.of(
                "timestamp", Instant.now().toString(),
                "status", 422,
                "message", errors
        ));
    }

    private HttpStatus resolveStatus(String msg) {
        if (msg == null) return HttpStatus.INTERNAL_SERVER_ERROR;
        if (msg.contains("not found")) return HttpStatus.NOT_FOUND;
        if (msg.contains("Already paid") || msg.contains("Already purchased")) return HttpStatus.CONFLICT;
        if (msg.contains("Access denied")) return HttpStatus.FORBIDDEN;
        return HttpStatus.BAD_REQUEST;
    }
}
