package com.nextgen.dating.model;

import java.util.List;

public class IcebreakerResponse {

    private boolean success;
    private String message;
    private List<String> icebreakers;
    private String sharedInterestNote;
    private String error;

    // Getters
    public boolean isSuccess() { return success; }
    public String getMessage() { return message; }
    public List<String> getIcebreakers() { return icebreakers; }
    public String getSharedInterestNote() { return sharedInterestNote; }
    public String getError() { return error; }

    // Builder
    public static Builder builder() { return new Builder(); }

    public static class Builder {
        private final IcebreakerResponse response = new IcebreakerResponse();

        public Builder success(boolean success) { response.success = success; return this; }
        public Builder message(String message) { response.message = message; return this; }
        public Builder icebreakers(List<String> icebreakers) { response.icebreakers = icebreakers; return this; }
        public Builder sharedInterestNote(String note) { response.sharedInterestNote = note; return this; }
        public Builder error(String error) { response.error = error; return this; }

        public IcebreakerResponse build() { return response; }
    }
}