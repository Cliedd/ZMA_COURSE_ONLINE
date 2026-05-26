package com.ztf.zma.community.service;

import com.ztf.zma.community.domain.Comment;
import com.ztf.zma.community.repository.CommentRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CommentService {

    private final CommentRepository commentRepository;

    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    @Transactional
    public Comment addComment(String userId, String lessonId, String content) {
        Comment comment = new Comment();
        comment.setUserId(userId);
        comment.setLessonId(lessonId);
        comment.setContent(content);
        return commentRepository.save(comment);
    }

    public Page<Comment> getCommentsByLesson(String lessonId, int page, int size) {
        Pageable pageable = PageRequest.of(page, Math.min(size, 100));
        return commentRepository.findByLessonIdOrderByCreatedAtAsc(lessonId, pageable);
    }

    @Transactional
    public void deleteComment(String commentId, String requestingUserId, String role) {
        Comment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Comment not found"));
        if (!comment.getUserId().equals(requestingUserId)
                && !"ADMIN".equals(role) && !"TEACHER".equals(role)) {
            throw new RuntimeException("Unauthorized");
        }
        commentRepository.deleteById(commentId);
    }
}
