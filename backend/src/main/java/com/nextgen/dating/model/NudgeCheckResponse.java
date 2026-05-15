package com.nextgen.dating.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class NudgeCheckResponse {
    private boolean nudgeRequired;
    private long silenceHours;
    private String nudgeMessage;
    private String matchId;
    private boolean success;
    private String error;
}
