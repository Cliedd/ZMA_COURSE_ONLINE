package com.ztf.zma.catalog.api;

import java.util.List;

public record QuestionRequest(
    String questionText,
    Integer positionOrder,
    List<OptionRequest> options
) {}
