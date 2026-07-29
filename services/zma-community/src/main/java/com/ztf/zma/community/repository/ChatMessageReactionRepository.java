package com.ztf.zma.community.repository;

import com.ztf.zma.community.domain.ChatMessageReaction;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ChatMessageReactionRepository extends JpaRepository<ChatMessageReaction, String> {
    List<ChatMessageReaction> findByMessageId(String messageId);
    Optional<ChatMessageReaction> findByMessageIdAndEmojiAndUserEmail(String messageId, String emoji, String userEmail);
    void deleteByMessageIdAndEmojiAndUserEmail(String messageId, String emoji, String userEmail);
}
