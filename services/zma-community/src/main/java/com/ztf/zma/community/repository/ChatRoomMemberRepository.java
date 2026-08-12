package com.ztf.zma.community.repository;

import com.ztf.zma.community.domain.ChatRoomMember;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ChatRoomMemberRepository extends JpaRepository<ChatRoomMember, String> {
    boolean existsByRoomIdAndStudentEmail(String roomId, String studentEmail);
    List<ChatRoomMember> findByRoomId(String roomId);
    long countByRoomId(String roomId);
}
