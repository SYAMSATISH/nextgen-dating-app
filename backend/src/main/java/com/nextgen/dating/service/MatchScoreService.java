package com.nextgen.dating.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextgen.dating.model.MatchScoreRequest;
import com.nextgen.dating.model.MatchScoreResponse;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class MatchScoreService {

    @Value("${claude.api.key}")
    private String anthropicApiKey;

    @Value("${claude.api.url}")
    private String claudeApiUrl;

    @Value("${claude.api.model}")
    private String claudeModel;

    @Value("${claude.api.version}")
    private String claudeVersion;

    private final OkHttpClient client = new OkHttpClient();
    private final ObjectMapper mapper = new ObjectMapper();

    public MatchScoreResponse calculateScore(MatchScoreRequest request) throws Exception {

        String prompt = String.format("""
            You are a dating app compatibility engine.
            Calculate a match score between 0 and 100 for these two users.

            User 1: %s
            User 2: %s

            Consider: shared interests, age compatibility, location, values, lifestyle.

            Respond ONLY in valid JSON with no extra text:
            {
              "score": 85,
              "reasons": ["Both love travel", "Same city"],
              "redFlags": ["Different lifestyle preferences"]
            }
            """,
            mapper.writeValueAsString(request.getUser1()),
            mapper.writeValueAsString(request.getUser2())
        );

        String requestBody = mapper.writeValueAsString(Map.of(
            "model", claudeModel,
            "max_tokens", 1000,
            "messages", List.of(Map.of("role", "user", "content", prompt))
        ));

        Request httpRequest = new Request.Builder()
            .url(claudeApiUrl)
            .post(RequestBody.create(requestBody, MediaType.get("application/json")))
            .addHeader("x-api-key", anthropicApiKey)
            .addHeader("anthropic-version", claudeVersion)
            .addHeader("Content-Type", "application/json")
            .build();

        try (Response response = client.newCall(httpRequest).execute()) {
            String responseBody = response.body().string();
            JsonNode root = mapper.readTree(responseBody);
            String text = root.at("/content/0/text").asText()
                .replace("```json", "")
                .replace("```", "")
                .trim();
            return mapper.readValue(text, MatchScoreResponse.class);
        }
    }
}