package com.ztf.zma.community.repository;

import com.ztf.zma.community.domain.ChatRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ChatRoomRepository extends JpaRepository<ChatRoom, String> {
    Optional<ChatRoom> findByCourseId(String courseId);
    List<ChatRoom> findByCreatedByEmail(String email);
}
