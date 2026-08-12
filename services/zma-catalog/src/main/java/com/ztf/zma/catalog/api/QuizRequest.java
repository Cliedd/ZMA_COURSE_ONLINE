package com.ztf.zma.catalog.api;

import com.ztf.zma.catalog.domain.QuizMode;
import java.util.List;

public record QuizRequest(
    String title,
    QuizMode mode,
    Integer passingScore,
    List<QuestionRequest> questions
) {}
