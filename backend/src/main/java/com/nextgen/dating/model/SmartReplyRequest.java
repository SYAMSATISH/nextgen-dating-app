package com.nextgen.dating.model;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.util.List;

@Data
public class SmartReplyRequest {
    @NotBlank(message = "senderName is required")
    private String senderName;
    @NotBlank(message = "lastMessage is required")
    private String lastMessage;
    private List<String> conversationHistory;
    private String tone = "casual";
}
