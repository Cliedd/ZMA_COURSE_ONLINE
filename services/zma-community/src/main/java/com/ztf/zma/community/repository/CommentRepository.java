package com.ztf.zma.community.repository;

import com.ztf.zma.community.domain.Comment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, String> {
    Page<Comment> findByLessonIdOrderByCreatedAtAsc(String lessonId, Pageable pageable);
    List<Comment> findByUserId(String userId);
}
