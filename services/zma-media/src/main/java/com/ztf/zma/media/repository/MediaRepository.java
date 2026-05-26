package com.ztf.zma.media.repository;

import com.ztf.zma.media.domain.Media;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MediaRepository extends JpaRepository<Media, String> {
    List<Media> findByCourseIdAndDeletedAtIsNull(String courseId);
    List<Media> findByLessonIdAndDeletedAtIsNull(String lessonId);
    List<Media> findByUploadedByAndDeletedAtIsNull(String uploadedBy);
    List<Media> findByStatusAndDeletedAtIsNull(String status);
}
