package com.ztf.zma.media.infrastructure;

/**
 * Client for checking course-enrollment status against zma-enrollment, used to grant
 * genuinely-enrolled students playback access to media they did not upload themselves
 * (see MediaService#getDownloadUrl).
 */
public interface EnrollmentClient {

    /**
     * Checks whether the caller identified by {@code authorizationHeader} (the same
     * "Bearer ..." header received on the inbound request — forwarded as-is so
     * zma-enrollment authenticates the original student, not zma-media) is enrolled
     * in {@code courseId}.
     *
     * Fails closed: any network error, non-2xx response, or malformed body is treated
     * as "not enrolled" rather than propagating an exception, so a transient outage of
     * zma-enrollment denies access instead of silently granting it.
     */
    boolean isEnrolled(String courseId, String authorizationHeader);
}
