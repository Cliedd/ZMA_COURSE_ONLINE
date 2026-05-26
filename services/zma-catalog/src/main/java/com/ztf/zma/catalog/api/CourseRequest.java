package com.ztf.zma.catalog.api;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;

public record CourseRequest(
        @NotBlank(message = "Le titre est obligatoire") String title,
        String slug,
        String description,
        String shortDescription,
        @Positive(message = "Le prix doit être positif") Double price,
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
