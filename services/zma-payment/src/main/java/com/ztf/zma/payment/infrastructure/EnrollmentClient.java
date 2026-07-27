package com.ztf.zma.payment.infrastructure;

public interface EnrollmentClient {
    void enroll(String studentId, String courseId, String courseTitle, String courseLevel);
}
