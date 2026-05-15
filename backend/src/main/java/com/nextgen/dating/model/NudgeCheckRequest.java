package com.nextgen.dating.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class NudgeCheckRequest {
    @NotBlank(message = "matchId is required")
    private String matchId;
    @NotBlank(message = "user1Name is required")
    private String user1Name;
    @NotBlank(message = "user2Name is required")
    private String user2Name;
    @NotNull(message = "lastMessageTimestamp is required")
    private Long lastMessageTimestamp;
    private String lastMessageSender;
    private String lastMessageText;
}
