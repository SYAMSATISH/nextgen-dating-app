package com.nextgen.dating.model;
import java.util.List;

public class IcebreakerRequest {

    private String user1Name;
    private String user1Bio;
    private List<String> user1Interests;

    private String user2Name;
    private String user2Bio;
    private List<String> user2Interests;

    public String getUser1Name() {
        return user1Name;
    }

    public void setUser1Name(String user1Name) {
        this.user1Name = user1Name;
    }

    public String getUser1Bio() {
        return user1Bio;
    }

    public void setUser1Bio(String user1Bio) {
        this.user1Bio = user1Bio;
    }

    public List<String> getUser1Interests() {
        return user1Interests;
    }

    public void setUser1Interests(List<String> user1Interests) {
        this.user1Interests = user1Interests;
    }

    public String getUser2Name() {
        return user2Name;
    }

    public void setUser2Name(String user2Name) {
        this.user2Name = user2Name;
    }

    public String getUser2Bio() {
        return user2Bio;
    }

    public void setUser2Bio(String user2Bio) {
        this.user2Bio = user2Bio;
    }

    public List<String> getUser2Interests() {
        return user2Interests;
    }

    public void setUser2Interests(List<String> user2Interests) {
        this.user2Interests = user2Interests;
    }
}