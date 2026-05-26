package com.nextgen.dating.model;

import java.util.List;

public class FilterResponse {
    private List<Match> matches;
    private boolean success;
    private String error;

    public List<Match> getMatches() { return matches; }
    public void setMatches(List<Match> matches) { this.matches = matches; }
    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }
    public String getError() { return error; }
    public void setError(String error) { this.error = error; }

    public static class Match {
        private String userId;
        private int score;
        private String reason;

        public String getUserId() { return userId; }
        public void setUserId(String userId) { this.userId = userId; }
        public int getScore() { return score; }
        public void setScore(int score) { this.score = score; }
        public String getReason() { return reason; }
        public void setReason(String reason) { this.reason = reason; }
    }
}
