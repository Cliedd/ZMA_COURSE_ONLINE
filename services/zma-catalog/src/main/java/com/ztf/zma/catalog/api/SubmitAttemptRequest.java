package com.ztf.zma.catalog.api;

import java.util.List;

public record SubmitAttemptRequest(List<AnswerRequest> answers) {}
