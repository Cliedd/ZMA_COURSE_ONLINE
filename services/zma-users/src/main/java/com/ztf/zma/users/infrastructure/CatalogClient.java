package com.ztf.zma.users.infrastructure;

/**
 * Minimal internal client for zma-catalog, used to compute a teacher's course
 * count for the public teacher profile endpoint.
 */
public interface CatalogClient {

    /** Number of courses owned by the given teacher email, or 0 if unavailable. */
    int countCoursesByTeacherEmail(String email);
}
