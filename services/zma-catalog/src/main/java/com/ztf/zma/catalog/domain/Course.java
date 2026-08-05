package com.ztf.zma.catalog.domain;

import jakarta.persistence.*;
import java.util.List;

@Entity
@Table(name = "courses")
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(unique = true, nullable = false)
    private String slug;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String shortDescription;

    private Double price;

    /** LICENCE | MASTER | DOCTORAT | CERTIFICAT | ATELIER */
    private String level;

    private String department;
    private String filiere;
    private Integer ects;
    private String teacherName;
    private Integer studentsCount;
    private Double rating;
    private Integer durationHours;

    /** CSS gradient class index 0-9 for card thumbnail */
    private Integer gradientIndex;

    /** Email of the owning teacher (null = official ZMA course) */
    private String teacherEmail;

    /** Publication workflow status */
    @Enumerated(EnumType.STRING)
    private CourseStatus status = CourseStatus.DRAFT;

    /** Admin's feedback when a course is sent back to REVISION_NEEDED */
    @Column(columnDefinition = "TEXT")
    private String reviewComment;

    /** Soft-delete timestamp */
    private java.time.Instant deletedAt;

    /** Total lesson count (updated when curriculum changes) */
    private Integer lessonCount = 0;

    /** JSON array of strings: ["Skill 1","Skill 2",...] */
    @Column(columnDefinition = "TEXT")
    private String skillsJson;

    /** JSON array [{id,title,lessons:[...]}] */
    @Column(columnDefinition = "TEXT")
    private String curriculumJson;

    /** Comma-separated career outcomes */
    @Column(columnDefinition = "TEXT")
    private String debouches;

    // Not populated by any write path (curriculum content lives in
    // curriculumJson, a plain TEXT column). Left mapped for schema
    // compatibility, but MUST stay @JsonIgnore: without it, Jackson calls
    // getSections() while serializing every Course returned by the API —
    // since this is LAZY and open-in-view is on, each call triggers its own
    // "SELECT ... FROM sections WHERE course_id=?" round trip, turning a
    // single paginated /api/v1/courses response into 1 + N extra queries
    // (measured: ~1.5-2s baseline latency for a 20-course page vs a normal
    // single-digit-ms query, confirmed via production load test 2026-08-05).
    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL)
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Section> sections;

    // ── Getters / Setters ────────────────────────────────────────────────────

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getShortDescription() { return shortDescription; }
    public void setShortDescription(String d) { this.shortDescription = d; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public String getDepartment() { return department; }
    public void setDepartment(String department) { this.department = department; }

    public String getFiliere() { return filiere; }
    public void setFiliere(String filiere) { this.filiere = filiere; }

    public Integer getEcts() { return ects; }
    public void setEcts(Integer ects) { this.ects = ects; }

    public String getTeacherName() { return teacherName; }
    public void setTeacherName(String teacherName) { this.teacherName = teacherName; }

    public Integer getStudentsCount() { return studentsCount; }
    public void setStudentsCount(Integer studentsCount) { this.studentsCount = studentsCount; }

    public Double getRating() { return rating; }
    public void setRating(Double rating) { this.rating = rating; }

    public Integer getDurationHours() { return durationHours; }
    public void setDurationHours(Integer durationHours) { this.durationHours = durationHours; }

    public Integer getGradientIndex() { return gradientIndex; }
    public void setGradientIndex(Integer gradientIndex) { this.gradientIndex = gradientIndex; }

    public String getSkillsJson() { return skillsJson; }
    public void setSkillsJson(String skillsJson) { this.skillsJson = skillsJson; }

    public String getCurriculumJson() { return curriculumJson; }
    public void setCurriculumJson(String curriculumJson) { this.curriculumJson = curriculumJson; }

    public String getDebouches() { return debouches; }
    public void setDebouches(String debouches) { this.debouches = debouches; }

    public String getTeacherEmail() { return teacherEmail; }
    public void setTeacherEmail(String teacherEmail) { this.teacherEmail = teacherEmail; }

    public CourseStatus getStatus() { return status; }
    public void setStatus(CourseStatus status) { this.status = status; }

    public String getReviewComment() { return reviewComment; }
    public void setReviewComment(String reviewComment) { this.reviewComment = reviewComment; }

    public java.time.Instant getDeletedAt() { return deletedAt; }
    public void setDeletedAt(java.time.Instant deletedAt) { this.deletedAt = deletedAt; }

    public boolean isDeleted() { return deletedAt != null; }

    public Integer getLessonCount() { return lessonCount; }
    public void setLessonCount(Integer lessonCount) { this.lessonCount = lessonCount; }

    @com.fasterxml.jackson.annotation.JsonProperty("published")
    public boolean isPublished() { return status == CourseStatus.PUBLISHED; }

    public List<Section> getSections() { return sections; }
    public void setSections(List<Section> sections) { this.sections = sections; }
}
