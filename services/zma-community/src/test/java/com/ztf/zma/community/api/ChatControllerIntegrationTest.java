package com.ztf.zma.community.api;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ztf.zma.community.domain.ChatRoom;
import com.ztf.zma.community.repository.ChatRoomRepository;
import com.ztf.zma.community.support.AbstractIntegrationTest;
import com.ztf.zma.community.support.JwtTestUtils;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Map;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

class ChatControllerIntegrationTest extends AbstractIntegrationTest {

    @Autowired
    private ChatRoomRepository roomRepository;

    private final ObjectMapper mapper = new ObjectMapper();

    private MockMvc mockMvc;
    private String roomId;
    private static final String STUDENT = "student@zma.test";
    private static final String OTHER = "other@zma.test";
    private String studentToken;
    private String otherToken;

    @BeforeEach
    void setUp() {
        mockMvc = mockMvc();
        studentToken = JwtTestUtils.token(STUDENT, "STUDENT");
        otherToken = JwtTestUtils.token(OTHER, "STUDENT");

        ChatRoom room = new ChatRoom();
        room.setCourseId("course-" + System.nanoTime());
        room.setCourseName("Test Course");
        room.setCreatedByEmail(STUDENT);
        room = roomRepository.save(room);
        roomId = room.getId();
    }

    private String sendMessage(Map<String, String> body, String token) throws Exception {
        String response = mockMvc.perform(post("/api/v1/community/rooms/{roomId}/messages", roomId)
                        .header("Authorization", "Bearer " + token)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(body)))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return mapper.readTree(response).get("id").asText();
    }

    @Test
    void reaction_toggleOnThenOff_updatesSummary() throws Exception {
        String messageId = sendMessage(Map.of("content", "hello"), studentToken);

        mockMvc.perform(post("/api/v1/community/rooms/{roomId}/messages/{msgId}/reactions", roomId, messageId)
                        .header("Authorization", "Bearer " + otherToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("emoji", "👍"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.counts.👍").value(1))
                .andExpect(jsonPath("$.reactors.👍[0]").value(OTHER));

        // toggling the same emoji again removes it
        mockMvc.perform(post("/api/v1/community/rooms/{roomId}/messages/{msgId}/reactions", roomId, messageId)
                        .header("Authorization", "Bearer " + otherToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of("emoji", "👍"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.counts.👍").doesNotExist());
    }

    @Test
    void thread_repliesReturnedInSentOrder() throws Exception {
        String parentId = sendMessage(Map.of("content", "root message"), studentToken);
        String reply1 = sendMessage(Map.of("content", "reply 1", "parentMessageId", parentId), otherToken);
        String reply2 = sendMessage(Map.of("content", "reply 2", "parentMessageId", parentId), studentToken);

        mockMvc.perform(get("/api/v1/community/rooms/{roomId}/messages/{msgId}/thread", roomId, parentId)
                        .header("Authorization", "Bearer " + studentToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].id").value(reply1))
                .andExpect(jsonPath("$[1].id").value(reply2));
    }

    @Test
    void message_withAttachmentAndNoContent_isAccepted() throws Exception {
        mockMvc.perform(post("/api/v1/community/rooms/{roomId}/messages", roomId)
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of(
                                "attachmentMediaId", "media-123",
                                "attachmentType", "image"))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.attachmentMediaId").value("media-123"))
                .andExpect(jsonPath("$.attachmentType").value("image"))
                .andExpect(jsonPath("$.content").value(""));
    }

    @Test
    void message_withNeitherContentNorAttachment_isRejected() throws Exception {
        mockMvc.perform(post("/api/v1/community/rooms/{roomId}/messages", roomId)
                        .header("Authorization", "Bearer " + studentToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(mapper.writeValueAsString(Map.of())))
                .andExpect(status().isBadRequest());
    }
}
