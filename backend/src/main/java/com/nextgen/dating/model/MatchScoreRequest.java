package com.nextgen.dating.model;

import java.util.Map;

public class MatchScoreRequest {
    private Map<String, Object> user1;
    private Map<String, Object> user2;

    public Map<String, Object> getUser1() { return user1; }
    public void setUser1(Map<String, Object> user1) { this.user1 = user1; }
    public Map<String, Object> getUser2() { return user2; }
    public void setUser2(Map<String, Object> user2) { this.user2 = user2; }
}