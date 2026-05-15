package com.nextgen.dating.service;

import com.nextgen.dating.model.NudgeCheckRequest;
import com.nextgen.dating.model.NudgeCheckResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

@Service
public class NudgeService {

    @Value("${nudge.silence.threshold.hours}")
    private long silenceThresholdHours;

    private final ClaudeApiService claudeApiService;

    public NudgeService(ClaudeApiService claudeApiService) {
        this.claudeApiService = claudeApiService;
    }

    public NudgeCheckResponse checkNudge(NudgeCheckRequest request) {
        try {
            long silenceHours = ChronoUnit.HOURS.between(
                    Instant.ofEpochMilli(request.getLastMessageTimestamp()),
                    Instant.now()
            );

            boolean nudgeRequired = silenceHours >= silenceThresholdHours;
            String nudgeMessage = null;

            if (nudgeRequired) {
                try {
                    String systemPrompt = """
                            Write a short push notification for a dating app.
                            Under 15 words. Warm and encouraging.
                            Return ONLY the notification text.
                            """;
                    String userPrompt = String.format("""
                            Match: %s, Silent for: %d hours, Last message: "%s"
                            Write a nudge notification.
                            """,
                            request.getUser2Name(), silenceHours,
                            request.getLastMessageText() != null ? request.getLastMessageText() : "a message"
                    );
                    nudgeMessage = claudeApiService.callClaude(systemPrompt, userPrompt).trim();
                } catch (Exception e) {
                    nudgeMessage = request.getUser2Name() + " is still waiting — don't let the spark fade! 🔥";
                }
            }

            return NudgeCheckResponse.builder()
                    .matchId(request.getMatchId())
                    .nudgeRequired(nudgeRequired)
                    .silenceHours(silenceHours)
                    .nudgeMessage(nudgeMessage)
                    .success(true)
                    .build();
        } catch (Exception e) {
            return NudgeCheckResponse.builder()
                    .matchId(request.getMatchId())
                    .success(false)
                    .error(e.getMessage())
                    .build();
        }
    }
}
