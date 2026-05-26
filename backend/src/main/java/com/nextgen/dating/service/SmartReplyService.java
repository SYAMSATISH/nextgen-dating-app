package com.nextgen.dating.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextgen.dating.model.SmartReplyRequest;
import com.nextgen.dating.model.SmartReplyResponse;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SmartReplyService {

    private final ClaudeApiService claudeApiService;
    private final ObjectMapper objectMapper;

    public SmartReplyService(ClaudeApiService claudeApiService, ObjectMapper objectMapper) {
        this.claudeApiService = claudeApiService;
        this.objectMapper = objectMapper;
    }

    public SmartReplyResponse generateReplies(SmartReplyRequest request) {
        try {
            String tone = request.getTone() != null ? request.getTone() : "casual";

            String systemPrompt = String.format("""
                    You are a smart reply assistant for a dating app.
                    Generate exactly 3 reply suggestions.
                    Tone: %s
                    Each reply under 20 words.
                    One direct, one question, one playful.
                    Return ONLY a JSON array of 3 strings, nothing else.
                    Example: ["Reply 1", "Reply 2", "Reply 3"]
                    """, tone);

            String userPrompt = String.format("""
                    Person: %s
                    Last message received: "%s"
                    Generate 3 reply suggestions.
                    """,
                    request.getSenderName(),
                    request.getLastMessage()
            );

            String raw = claudeApiService.callClaude(systemPrompt, userPrompt);
            List<String> suggestions = parseJsonArray(raw);

            return SmartReplyResponse.builder()
                    .suggestions(suggestions)
                    .tone(tone)
                    .success(true)
                    .build();

        } catch (Exception e) {
            return SmartReplyResponse.builder()
                    .success(false)
                    .error(e.getMessage())
                    .suggestions(List.of(
                        "That sounds amazing, tell me more!",
                        "Really? What made you feel that way?",
                        "Ha, same here! Great minds think alike 😄"
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