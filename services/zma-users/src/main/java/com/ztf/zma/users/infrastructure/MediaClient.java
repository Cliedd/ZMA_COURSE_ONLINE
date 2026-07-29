package com.ztf.zma.users.infrastructure;

/**
 * Minimal internal client for zma-media, used to resolve a mediaId (once the
 * image has been uploaded/confirmed via zma-media's own presign -> upload -> confirm
 * pipeline) into a display URL to store as the profile's avatarUrl.
 */
public interface MediaClient {

    /**
     * @param mediaId the confirmed media item's id
     * @param bearerToken the caller's raw JWT (without "Bearer " prefix) to forward,
     *                    since zma-media's /url endpoint only allows the uploader/ADMIN/TEACHER
     * @return a display URL, or null if the media could not be resolved
     */
    String resolveAvatarUrl(String mediaId, String bearerToken);
}
