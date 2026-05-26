package com.nextgen.dating.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@Service
public class ClaudeApiService {

    @Value("${claude.api.url}")
    private String apiUrl;

    @Value("${claude.api.key}")
    private String apiKey;

    @Value("${claude.api.model}")
    private String model;

    @Value("${claude.api.version}")
    private String apiVersion;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String callClaude(String systemPrompt, String userPrompt) {
        try {
            String body = String.format("""
                {
                    "model": "%s",
                    "max_tokens": 1000,
                    "system": "%s",
                    "messages": [
                        {"role": "user", "content": "%s"}
                    ]
                }
                """,
                model,
                systemPrompt.replace("\"", "\\\"").replace("\n", "\\n"),
                userPrompt.replace("\"", "\\\"").replace("\n", "\\n")
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(apiUrl))
                    .header("Content-Type", "application/json")
                    .header("x-api-key", apiKey)
                    .header("anthropic-version", apiVersion)
                    .POST(HttpRequest.BodyPublishers.ofString(body))
                    .build();

            HttpResponse<String> response = httpClient.send(
                    request, HttpResponse.BodyHandlers.ofString()
            );

            System.out.println("Status: " + response.statusCode());
            System.out.println("Body: " + response.body());

            JsonNode json = objectMapper.readTree(response.body());

            // Error వస్తే throw చేయి
            if (json.has("error")) {
                throw new RuntimeException(json.get("error").get("message").asText());
            }

            // Content array నుండి text తీసుకో
            JsonNode content = json.get("content");
            if (content != null && content.isArray() && content.size() > 0) {
                return content.get(0).get("text").asText();
            }

            throw new RuntimeException("No content in response: " + response.body());

        } catch (Exception e) {
            throw new RuntimeException("Claude API call failed: " + e.getMessage(), e);
        }
    }
}
