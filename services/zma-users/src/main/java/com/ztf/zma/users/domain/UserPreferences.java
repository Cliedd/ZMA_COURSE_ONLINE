package com.ztf.zma.users.domain;

import jakarta.persistence.*;

/**
 * User notification and display preferences.
 * One-to-one with UserProfile (shared PK).
 */
@Entity
@Table(name = "user_preferences")
public class UserPreferences {

    /** Same ID as UserProfile */
    @Id
    private String userId;

    @Column(nullable = false)
    private String language = "fr";

    @Column(nullable = false)
    private String timezone = "Africa/Douala";

    /** Receive email notifications for new courses, announcements */
    @Column(nullable = false)
    private Boolean emailNotifications = true;

    /** Receive email notifications for new chat messages */
    @Column(nullable = false)
    private Boolean chatEmailNotifications = false;

    /** Receive in-app notifications when someone comments on my lesson */
    @Column(nullable = false)
    private Boolean commentNotifications = true;

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getTimezone() { return timezone; }
    public void setTimezone(String timezone) { this.timezone = timezone; }

    public Boolean getEmailNotifications() { return emailNotifications; }
    public void setEmailNotifications(Boolean emailNotifications) { this.emailNotifications = emailNotifications; }

    public Boolean getChatEmailNotifications() { return chatEmailNotifications; }
    public void setChatEmailNotifications(Boolean chatEmailNotifications) { this.chatEmailNotifications = chatEmailNotifications; }

    public Boolean getCommentNotifications() { return commentNotifications; }
    public void setCommentNotifications(Boolean commentNotifications) { this.commentNotifications = commentNotifications; }
}
