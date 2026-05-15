package com.nextgen.dating.model;
import java.util.List;

public class SmartReplyRequest {

    private String senderName;
    private String lastMessage;
private List<String> conversationHistory;
    private String tone;

    public String getSenderName() {
        return senderName;
    }

    public String getLastMessage() {
        return lastMessage;
    }

    public List<String> getConversationHistory() {
        return conversationHistory;
    }

    public String getTone() {
        return tone;
    }

    public void setSenderName(String senderName) {
        this.senderName = senderName;
    }

    public void setLastMessage(String lastMessage) {
        this.lastMessage = lastMessage;
    }

    public void setConversationHistory(List<String> conversationHistory) {
        this.conversationHistory = conversationHistory;
    }

    public void setTone(String tone) {
        this.tone = tone;
    }
}