package com.nextgen.dating.model;

import java.util.List;

public class SmartReplyResponse {

    private boolean success;
    private String message;
    private List<String> suggestions;
    private String tone;
    private String error;

    // Getters
    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public List<String> getSuggestions() { return suggestions; }
    public String getTone() { return tone; }
    public String getError() { return error; }

    // Builder
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final SmartReplyResponse response = new SmartReplyResponse();

        public Builder success(boolean success) { response.success = success; return this; }
        public Builder message(String message) { response.message = message; return this; }
        public Builder suggestions(List<String> suggestions) { response.suggestions = suggestions; return this; }
        public Builder tone(String tone) { response.tone = tone; return this; }
        public Builder error(String error) { response.error = error; return this; }

        public SmartReplyResponse build() { return response; }
    }
}