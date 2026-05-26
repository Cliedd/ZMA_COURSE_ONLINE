package com.ztf.zma.enrollment.domain;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "enrollments")
public class Enrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String studentId;
    private String courseId;

    /** Course title (denormalized to avoid cross-service reads) */
    private String courseTitle;

    /** Course level */
    private String courseLevel;

    /** Progress 0.0 – 100.0 */
    private Double progress;

    /** JSON array of completed lesson IDs, e.g. ["id1","id2"] */
    @Column(columnDefinition = "TEXT")
    private String completedLessonsJson;

    private LocalDateTime enrolledAt;

    /** Set when progress reaches 100 */
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        if (enrolledAt == null) enrolledAt = LocalDateTime.now();
        if (progress == null) progress = 0.0;
        if (completedLessonsJson == null) completedLessonsJson = "[]";
    }

    // ── Getters / Setters ─────────────────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }

    public String getCourseId() { return courseId; }
    public void setCourseId(String courseId) { this.courseId = courseId; }

    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }

    public String getCourseLevel() { return courseLevel; }
    public void setCourseLevel(String courseLevel) { this.courseLevel = courseLevel; }

    public Double getProgress() { return progress; }
    public void setProgress(Double progress) { this.progress = progress; }

    public String getCompletedLessonsJson() { return completedLessonsJson; }
    public void setCompletedLessonsJson(String completedLessonsJson) { this.completedLessonsJson = completedLessonsJson; }

    public LocalDateTime getEnrolledAt() { return enrolledAt; }
    public void setEnrolledAt(LocalDateTime enrolledAt) { this.enrolledAt = enrolledAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}
