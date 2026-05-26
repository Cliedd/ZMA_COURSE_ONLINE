package com.ztf.zma.community.repository;

import com.ztf.zma.community.domain.ChatMessage;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ChatMessageRepository extends JpaRepository<ChatMessage, String> {
    Page<ChatMessage> findByRoomIdOrderBySentAtDesc(String roomId, Pageable pageable);
    List<ChatMessage> findByRoomIdAndSentAtAfterOrderBySentAtAsc(String roomId, LocalDateTime after);
    long countByRoomId(String roomId);
}
