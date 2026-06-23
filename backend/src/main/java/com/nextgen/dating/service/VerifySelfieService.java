package com.nextgen.dating.service;

import com.nextgen.dating.model.VerifySelfieRequest;
import com.nextgen.dating.model.VerifySelfieResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.ResponseEntity;

import java.util.HashMap;
import java.util.Map;

@Service
public class VerifySelfieService {

    @Value("${face.service.url:https://cuddly-halibut-4q754w5r4ggwf57g4-5001.app.github.dev}")
    private String faceServiceUrl;

    private final RestTemplate restTemplate;

    public VerifySelfieService(RestTemplate restTemplate) {
        this.restTemplate = restTemplate;
    }

    public VerifySelfieResponse verify(VerifySelfieRequest request) {
        String url = faceServiceUrl + "/verify-face";
        System.out.println(" Calling Python at: " + url);
        System.out.println(" Selfie length: " + (request.getSelfie() != null ? request.getSelfie().length() : "null"));
        System.out.println(" Profile length: " + (request.getProfilePhoto() != null ? request.getProfilePhoto().length() : "null"));

        Map<String, String> body = new HashMap<>();
        body.put("selfie", request.getSelfie());
        body.put("profilePhoto", request.getProfilePhoto());

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(url, body, Map.class);
            Map<?, ?> result = response.getBody();
            System.out.println("✅ Python response: " + result);

            boolean verified = (Boolean) result.get("verified");
            double similarity = ((Number) result.get("similarity")).doubleValue();
            String confidence = (String) result.get("confidence");

            String message = verified
                ? "✅ Selfie matches your profile photo."
                : "❌ Selfie does not match. Please use your real photo.";

            return new VerifySelfieResponse(verified, similarity, confidence, message);

        } catch (HttpClientErrorException e) {
            System.out.println("❌ HTTP Error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString());
            return new VerifySelfieResponse(false, 0.0, "low",
                "No face detected. Please upload a clear photo.");
        } catch (Exception e) {
            System.out.println("❌ Error calling Python: " + e.getClass().getName() + " - " + e.getMessage());
            return new VerifySelfieResponse(false, 0.0, "low",
                "Verification service unavailable. Try again later.");
        }
    }
}
