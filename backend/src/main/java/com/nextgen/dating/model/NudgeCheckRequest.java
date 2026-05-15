package com.nextgen.dating.model;

public class NudgeCheckRequest {

    private String matchId;
    private String user2Name;
    private String lastMessageText;
    private Long lastMessageTimestamp;

    public String getMatchId() {
        return matchId;
    }

    public String getUser2Name() {
        return user2Name;
    }

    public String getLastMessageText() {
        return lastMessageText;
    }

    public Long getLastMessageTimestamp() {
        return lastMessageTimestamp;
    }

    public void setMatchId(String matchId) {
        this.matchId = matchId;
    }

    public void setUser2Name(String user2Name) {
        this.user2Name = user2Name;
    }

    public void setLastMessageText(String lastMessageText) {
        this.lastMessageText = lastMessageText;
    }

    public void setLastMessageTimestamp(Long lastMessageTimestamp) {
        this.lastMessageTimestamp = lastMessageTimestamp;
    }
}