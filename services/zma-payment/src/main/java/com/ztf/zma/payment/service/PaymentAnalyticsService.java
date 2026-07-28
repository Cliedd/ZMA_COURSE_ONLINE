package com.ztf.zma.payment.service;

import com.ztf.zma.payment.domain.Payment;
import com.ztf.zma.payment.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * Real revenue/payout aggregation over confirmed (SUCCESS) payments — replaces
 * the frontend's catalog-derived "potential revenue" estimate with figures
 * computed from what was actually collected.
 */
@Service
public class PaymentAnalyticsService {

    private final PaymentRepository paymentRepository;

    /** Share of a sale that goes to the teacher; the rest is the platform's. */
    @Value("${payment.teacher-share-rate:0.70}")
    private double teacherShareRate;

    public PaymentAnalyticsService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }

    public record RevenuePoint(String period, double amount, long transactionCount) {}

    public record RevenueAnalytics(
            String groupBy, Instant from, Instant to,
            double totalRevenue, long totalTransactions,
            Map<String, Double> byCurrency, List<RevenuePoint> points) {}

    public record TeacherPayout(
            String teacherEmail, double totalRevenue,
            double teacherShare, double platformShare, long transactionCount) {}

    public record TeacherPayoutAnalytics(
            Instant from, Instant to, double teacherShareRate, List<TeacherPayout> payouts) {}

    public RevenueAnalytics revenue(Instant from, Instant to, String groupBy) {
        List<Payment> payments = paymentRepository.findByStatusAndConfirmedAtBetween("SUCCESS", from, to);
        DateTimeFormatter formatter = periodFormatter(groupBy);

        Map<String, double[]> byPeriod = new LinkedHashMap<>(); // [amount, count]
        Map<String, Double> byCurrency = new LinkedHashMap<>();
        double total = 0;

        for (Payment p : payments) {
            double amount = p.getAmount() != null ? p.getAmount() : 0.0;
            String period = formatter.format(p.getConfirmedAt().atZone(ZoneOffset.UTC));
            byPeriod.computeIfAbsent(period, k -> new double[2]);
            byPeriod.get(period)[0] += amount;
            byPeriod.get(period)[1] += 1;
            byCurrency.merge(p.getCurrency(), amount, Double::sum);
            total += amount;
        }

        List<RevenuePoint> points = new ArrayList<>();
        byPeriod.forEach((period, agg) -> points.add(new RevenuePoint(period, agg[0], (long) agg[1])));
        points.sort(Comparator.comparing(RevenuePoint::period));

        return new RevenueAnalytics(groupBy, from, to, total, payments.size(), byCurrency, points);
    }

    public TeacherPayoutAnalytics teacherPayouts(Instant from, Instant to) {
        List<Payment> payments = paymentRepository.findByStatusAndConfirmedAtBetween("SUCCESS", from, to);

        Map<String, double[]> byTeacher = new LinkedHashMap<>(); // [amount, count]
        for (Payment p : payments) {
            String teacherEmail = p.getTeacherEmail() != null ? p.getTeacherEmail() : "unknown";
            double amount = p.getAmount() != null ? p.getAmount() : 0.0;
            byTeacher.computeIfAbsent(teacherEmail, k -> new double[2]);
            byTeacher.get(teacherEmail)[0] += amount;
            byTeacher.get(teacherEmail)[1] += 1;
        }

        List<TeacherPayout> payouts = new ArrayList<>();
        byTeacher.forEach((teacherEmail, agg) -> {
            double revenue = agg[0];
            double teacherShare = round2(revenue * teacherShareRate);
            double platformShare = round2(revenue - teacherShare);
            payouts.add(new TeacherPayout(teacherEmail, revenue, teacherShare, platformShare, (long) agg[1]));
        });
        payouts.sort(Comparator.comparingDouble(TeacherPayout::totalRevenue).reversed());

        return new TeacherPayoutAnalytics(from, to, teacherShareRate, payouts);
    }

    private DateTimeFormatter periodFormatter(String groupBy) {
        return switch (groupBy) {
            case "year" -> DateTimeFormatter.ofPattern("yyyy");
            case "day" -> DateTimeFormatter.ofPattern("yyyy-MM-dd");
            default -> DateTimeFormatter.ofPattern("yyyy-MM"); // "month"
        };
    }

    private double round2(double v) {
        return Math.round(v * 100.0) / 100.0;
    }
}
