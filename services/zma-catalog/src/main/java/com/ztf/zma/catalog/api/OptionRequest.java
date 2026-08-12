package com.ztf.zma.catalog.api;

public record OptionRequest(
    String optionText,
    boolean correct,
    Integer positionOrder
) {}
