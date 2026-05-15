package com.nextgen.dating.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class IcebreakerResponse {
    private List<String> icebreakers;
    private String sharedInterestNote;
    private boolean success;
    private String error;
}
