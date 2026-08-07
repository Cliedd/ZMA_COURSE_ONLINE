package com.ztf.zma.catalog.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.PositiveOrZero;

public record CourseRequest(
        @NotBlank(message = "Title is required") String title,
        String slug,
        String description,
        String shortDescription,
        @PositiveOrZero(message = "Price must be zero or positive") Double price,
        String level,
        String department,
        String filiere,
        Integer ects,
        String teacherName,
        Integer studentsCount,
        Double rating,
        Integer durationHours,
        Integer gradientIndex,
        String skillsJson,
        String curriculumJson,
        String debouches
) {}
