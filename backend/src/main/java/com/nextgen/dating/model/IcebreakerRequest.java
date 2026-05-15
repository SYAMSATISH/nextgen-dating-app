package com.nextgen.dating.model;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.List;

@Data
public class IcebreakerRequest {
    @NotBlank(message = "user1Name is required")
    private String user1Name;
    @NotBlank(message = "user2Name is required")
    private String user2Name;
    @NotNull(message = "user1Interests is required")
    private List<String> user1Interests;
    @NotNull(message = "user2Interests is required")
    private List<String> user2Interests;
    private String user1Bio;
    private String user2Bio;
}