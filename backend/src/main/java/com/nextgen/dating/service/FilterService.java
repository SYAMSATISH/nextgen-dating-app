package com.nextgen.dating.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextgen.dating.model.FilterRequest;
import com.nextgen.dating.model.FilterResponse;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class FilterService {

    private final ClaudeApiService claudeApiService;
    private final ObjectMapper objectMapper;

    public FilterService(ClaudeApiService claudeApiService, ObjectMapper objectMapper) {
        this.claudeApiService = claudeApiService;
        this.objectMapper = objectMapper;
    }

    public FilterResponse getCompatibleMatches(FilterRequest request) {
        FilterResponse response = new FilterResponse();
        try {
            String systemPrompt = """
                    You are a dating app matchmaking AI.
                    Based on user filters, generate compatible matches.
                    Return ONLY a JSON array like this:
                    [
                      {"userId": "xyz", "score": 92, "reason": "Same career field"},
                      {"userId": "abc", "score": 88, "reason": "Similar lifestyle"}
                    ]
                    No extra text, no markdown.
                    """;

            String userPrompt = String.format("""
                    User ID: %s
                    Career: %s
                    Lifestyle: %s
                    Age Range: %d - %d
                    Location: %s
                    Generate 3 compatible matches with scores and reasons.
                    """,
                    request.getUserId(),
                    request.getFilters().getCareer(),
                    request.getFilters().getLifestyle(),
                    request.getFilters().getAgeRange().get(0),
                    request.getFilters().getAgeRange().get(1),
                    request.getFilters().getLocation()
            );

            String raw = claudeApiService.callClaude(systemPrompt, userPrompt);
            String cleaned = raw.replaceAll("```json|```", "").trim();

            List<FilterResponse.Match> matches = objectMapper.readValue(
                    cleaned, new TypeReference<List<FilterResponse.Match>>() {}
            );

            response.setMatches(matches);
            response.setSuccess(true);

        } catch (Exception e) {
            FilterResponse.Match m1 = new FilterResponse.Match();
            m1.setUserId("xyz"); m1.setScore(92); m1.setReason("Same career field");

            FilterResponse.Match m2 = new FilterResponse.Match();
            m2.setUserId("abc"); m2.setScore(88); m2.setReason("Similar lifestyle");

            response.setMatches(List.of(m1, m2));
            response.setSuccess(false);
            response.setError(e.getMessage());
        }
        return response;
    }
}
