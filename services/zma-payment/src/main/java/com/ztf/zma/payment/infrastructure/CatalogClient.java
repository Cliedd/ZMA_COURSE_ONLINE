package com.ztf.zma.payment.infrastructure;

import java.util.Map;

public interface CatalogClient {
    Map<String, Object> getCourseInfo(String courseId);
    Double getCoursePrice(String courseId);
    String getCourseTitle(String courseId);
}
