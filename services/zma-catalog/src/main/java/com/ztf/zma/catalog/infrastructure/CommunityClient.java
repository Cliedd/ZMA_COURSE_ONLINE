package com.ztf.zma.catalog.infrastructure;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

/**
 * Client HTTP vers zma-community — fire-and-forget uniquement.
 * Toute exception est loguée et swallowée pour ne jamais bloquer le flux catalog.
 */
@Component
public class CommunityClient {

    private static final Logger log = LoggerFactory.getLogger(CommunityClient.class);

    private final RestTemplate restTemplate;
    private final String communityUrl;

    public CommunityClient(RestTemplateBuilder builder,
                           @Value("${community.service.url:http://zma-community:8085}") String communityUrl) {
        this.restTemplate = builder.build();
        this.communityUrl = communityUrl;
    }

    /** Crée automatiquement un canal de chat lors de la publication d'un cours. */
    public void createChatRoom(String courseId, String courseName, String teacherEmail) {
        try {
            Map<String, String> body = Map.of(
                "courseId",       courseId,
                "courseName",     courseName != null ? courseName : "",
                "createdByEmail", teacherEmail != null ? teacherEmail : ""
            );
            restTemplate.postForObject(communityUrl + "/api/v1/community/rooms", body, Object.class);
            log.info("Canal de chat créé pour le cours {}", courseId);
        } catch (Exception e) {
            log.warn("Impossible de créer le canal de chat pour le cours {} : {}", courseId, e.getMessage());
        }
    }
}
