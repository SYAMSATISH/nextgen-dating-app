package com.nextgen.dating.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextgen.dating.model.IcebreakerRequest;
import com.nextgen.dating.model.IcebreakerResponse;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class IcebreakerService {

    private final ClaudeApiService claudeApiService;
    private final ObjectMapper objectMapper;

    public IcebreakerService(ClaudeApiService claudeApiService, ObjectMapper objectMapper) {
        this.claudeApiService = claudeApiService;
        this.objectMapper = objectMapper;
    }

    public IcebreakerResponse generateIcebreakers(IcebreakerRequest request) {
        try {
            List<String> shared = request.getUser1Interests().stream()
                    .filter(i -> request.getUser2Interests().stream()
                            .anyMatch(j -> j.equalsIgnoreCase(i)))
                    .collect(Collectors.toList());

            String sharedNote = shared.isEmpty()
                    ? "No direct overlap"
                    : "You both love: " + String.join(", ", shared);

            String systemPrompt = """
                    You are a witty conversation coach for a dating app.
                    Generate exactly 3 short icebreaker messages.
                    Each message under 25 words.
                    Return ONLY a JSON array of 3 strings.
                    Example: ["Message 1", "Message 2", "Message 3"]
                    """;

            String userPrompt = String.format("""
                    User1: %s, interests: %s, bio: %s
                    User2: %s, interests: %s, bio: %s
                    Shared: %s
                    Generate 3 icebreakers for %s to send to %s.
                    """,
                    request.getUser1Name(), request.getUser1Interests(),
                    request.getUser1Bio() != null ? request.getUser1Bio() : "none",
                    request.getUser2Name(), request.getUser2Interests(),
                    request.getUser2Bio() != null ? request.getUser2Bio() : "none",
                    sharedNote,
                    request.getUser1Name(), request.getUser2Name()
            );

            String raw = claudeApiService.callClaude(systemPrompt, userPrompt);
            List<String> icebreakers = parseJsonArray(raw);

            return IcebreakerResponse.builder()
                    .icebreakers(icebreakers)
                    .sharedInterestNote(sharedNote)
                    .success(true)
                    .build();
        } catch (Exception e) {
            return IcebreakerResponse.builder()
                    .success(false)
                    .error(e.getMessage())
                    .icebreakers(List.of(
                        "Hey! What's been your highlight this week?",
                        "Your profile caught my eye — tell me more!",
                        "Hi! What are you looking forward to lately?"
                    ))
                    .build();
        }
    }

    private List<String> parseJsonArray(String raw) {
        try {
            String cleaned = raw.replaceAll("json|", "").trim();
            return objectMapper.readValue(cleaned, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return List.of(raw.split("\n")).stream()
                    .map(s -> s.replaceAll("^[\\-\\d\\.\\)\\s]+", "").trim())
                    .filter(s -> !s.isBlank())
                    .limit(3)
                    .collect(Collectors.toList());
        }
    }
}
