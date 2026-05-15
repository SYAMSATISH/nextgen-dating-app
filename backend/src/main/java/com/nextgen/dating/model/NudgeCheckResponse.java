package com.nextgen.dating.model;

public class NudgeCheckResponse {

    private boolean success;
    private String message;
    private String matchId;
    private boolean nudgeRequired;
    private long silenceHours;
    private String nudgeMessage;
    private String error;

    // Getters
    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public String getMatchId() { return matchId; }
    public boolean isNudgeRequired() { return nudgeRequired; }
    public long getSilenceHours() { return silenceHours; }
    public String getNudgeMessage() { return nudgeMessage; }
    public String getError() { return error; }

    // Builder
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final NudgeCheckResponse response = new NudgeCheckResponse();

        public Builder success(boolean success) { response.success = success; return this; }
        public Builder message(String message) { response.message = message; return this; }
        public Builder matchId(String matchId) { response.matchId = matchId; return this; }
        public Builder nudgeRequired(boolean nudgeRequired) { response.nudgeRequired = nudgeRequired; return this; }
        public Builder silenceHours(long silenceHours) { response.silenceHours = silenceHours; return this; }
        public Builder nudgeMessage(String nudgeMessage) { response.nudgeMessage = nudgeMessage; return this; }
        public Builder error(String error) { response.error = error; return this; }

        public NudgeCheckResponse build() { return response; }
    }
}