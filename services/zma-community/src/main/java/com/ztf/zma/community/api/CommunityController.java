package com.ztf.zma.community.api;

import com.ztf.zma.community.domain.Comment;
import com.ztf.zma.community.service.CommentService;
import io.swagger.v3.oas.annotations.Operation;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/community")
public class CommunityController {

    private final CommentService commentService;

    public CommunityController(CommentService commentService) {
        this.commentService = commentService;
    }

    @Operation(summary = "Add a comment on a lesson")
    @PostMapping("/comments")
    @ResponseStatus(HttpStatus.CREATED)
    public Comment addComment(@Valid @RequestBody CommentRequest request,
                              Authentication auth) {
        return commentService.addComment(auth.getName(), request.lessonId(), request.content());
    }

    /** Paginated comments for a lesson */
    @GetMapping("/comments/lesson/{lessonId}")
    public Page<Comment> getCommentsByLesson(
            @PathVariable String lessonId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "20") int size) {
        return commentService.getCommentsByLesson(lessonId, page, size);
    }

    @DeleteMapping("/comments/{commentId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteComment(@PathVariable String commentId, Authentication auth) {
        commentService.deleteComment(commentId, auth.getName(), getRole(auth));
    }

    private String getRole(Authentication auth) {
        return auth.getAuthorities().stream()
            .map(GrantedAuthority::getAuthority)
            .filter(a -> a.startsWith("ROLE_"))
            .map(a -> a.substring(5))
            .findFirst().orElse("STUDENT");
    }
}
