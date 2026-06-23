package com.nextgen.dating.model;
public class NotificationRequest {
    private String fcmToken;
    private String type;
    private String senderName;
    private String senderId;

    public String getFcmToken() { return fcmToken; }
    public void setFcmToken(String fcmToken) { this.fcmToken = fcmToken; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getSenderName() { return senderName; }
    public void setSenderName(String senderName) { this.senderName = senderName; }
    public String getSenderId() { return senderId; }
    public void setSenderId(String senderId) { this.senderId = senderId; }
}