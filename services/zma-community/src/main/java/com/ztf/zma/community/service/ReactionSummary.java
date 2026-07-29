package com.ztf.zma.community.service;

import java.util.List;
import java.util.Map;

/**
 * Room-wide broadcast payload after a reaction toggle: emoji -> count and
 * emoji -> reactor emails, so each client can derive "did I react" locally.
 */
public class ReactionSummary {

    private String messageId;
    private Map<String, Long> counts;
    private Map<String, List<String>> reactors;

    public ReactionSummary() {}

    public ReactionSummary(String messageId, Map<String, Long> counts, Map<String, List<String>> reactors) {
        this.messageId = messageId;
        this.counts = counts;
        this.reactors = reactors;
    }

    public String getMessageId() { return messageId; }
    public void setMessageId(String messageId) { this.messageId = messageId; }
    public Map<String, Long> getCounts() { return counts; }
    public void setCounts(Map<String, Long> counts) { this.counts = counts; }
    public Map<String, List<String>> getReactors() { return reactors; }
    public void setReactors(Map<String, List<String>> reactors) { this.reactors = reactors; }
}
