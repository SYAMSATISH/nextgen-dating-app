package com.nextgen.dating.model;

import java.util.List;

public class MatchScoreResponse {
    private int score;
    private List<String> reasons;
    private List<String> redFlags;

    public int getScore() { return score; }
    public void setScore(int score) { this.score = score; }
    public List<String> getReasons() { return reasons; }
    public void setReasons(List<String> reasons) { this.reasons = reasons; }
    public List<String> getRedFlags() { return redFlags; }
    public void setRedFlags(List<String> redFlags) { this.redFlags = redFlags; }
}