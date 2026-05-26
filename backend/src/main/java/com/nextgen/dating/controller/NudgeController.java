package com.nextgen.dating.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class NudgeController {

    @PostMapping("/nudge-check")
    public ResponseEntity<?> checkNudge(@RequestBody Map<String, String> request) {
        try {
            String lastMessageTime = request.get("lastMessageTime");
            String chatId = request.get("chatId");

            if (lastMessageTime == null) {
                return ResponseEntity.ok(Map.of(
                    "shouldNudge", false,
                    "message", ""
                ));
            }

            Instant lastMessage = Instant.parse(lastMessageTime);
            Instant now = Instant.now();
            long hoursDiff = ChronoUnit.HOURS.between(lastMessage, now);

            boolean shouldNudge = hoursDiff >= 24;
            String message = shouldNudge 
                ? "Hey! Don't let this conversation go cold 🔥 " + chatId
                : "Conversation is active!";

            return ResponseEntity.ok(Map.of(
                "shouldNudge", shouldNudge,
                "message", message,
                "hoursSinceLastMessage", hoursDiff
            ));

        } catch (Exception e) {
            return ResponseEntity.ok(Map.of(
                "shouldNudge", true,
                "message", "Hey! Don't let this conversation go cold 🔥",
                "error", e.getMessage()
            ));
        }
    }
}