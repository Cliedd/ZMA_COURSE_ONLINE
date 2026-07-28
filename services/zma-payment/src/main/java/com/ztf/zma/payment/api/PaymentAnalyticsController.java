package com.ztf.zma.payment.api;

import com.ztf.zma.payment.service.PaymentAnalyticsService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Set;

/** ADMIN-only real revenue/payout figures — replaces the frontend's catalog-derived estimate. */
@RestController
@RequestMapping("/api/v1/payments/analytics")
public class PaymentAnalyticsController {

    private static final Set<String> VALID_GROUP_BY = Set.of("day", "month", "year");

    private final PaymentAnalyticsService analyticsService;

    public PaymentAnalyticsController(PaymentAnalyticsService analyticsService) {
        this.analyticsService = analyticsService;
    }

    @Operation(summary = "Real revenue aggregation", description = "Requires ROLE_ADMIN")
    @GetMapping("/revenue")
    public PaymentAnalyticsService.RevenueAnalytics revenue(
            @RequestParam(defaultValue = "month") String groupBy,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            Authentication auth) {
        requireAdmin(auth);
        if (!VALID_GROUP_BY.contains(groupBy)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "groupBy must be day, month or year");
        }
        return analyticsService.revenue(parseFrom(from), parseTo(to), groupBy);
    }

    @Operation(summary = "Teacher revenue-share payouts", description = "Requires ROLE_ADMIN")
    @GetMapping("/teacher-payouts")
    public PaymentAnalyticsService.TeacherPayoutAnalytics teacherPayouts(
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            Authentication auth) {
        requireAdmin(auth);
        return analyticsService.teacherPayouts(parseFrom(from), parseTo(to));
    }

    private Instant parseFrom(String from) {
        return from != null && !from.isBlank() ? Instant.parse(from) : Instant.now().minus(365, ChronoUnit.DAYS);
    }

    private Instant parseTo(String to) {
        return to != null && !to.isBlank() ? Instant.parse(to) : Instant.now();
    }

    private void requireAdmin(Authentication auth) {
        boolean isAdmin = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch("ROLE_ADMIN"::equals);
        if (!isAdmin) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "ADMIN role required");
        }
    }
}
