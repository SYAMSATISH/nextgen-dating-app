package com.nextgen.dating.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class SmartReplyResponse {
    private List<String> suggestions;
    private String tone;
    private boolean success;
    private String error;
}
