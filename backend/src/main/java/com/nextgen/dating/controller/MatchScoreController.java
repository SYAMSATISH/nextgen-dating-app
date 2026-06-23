package com.nextgen.dating.controller;

import com.nextgen.dating.model.MatchScoreRequest;
import com.nextgen.dating.model.MatchScoreResponse;
import com.nextgen.dating.service.MatchScoreService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class MatchScoreController {

    @Autowired
    private MatchScoreService matchScoreService;

    @PostMapping("/match-score")
    public ResponseEntity<?> getMatchScore(@RequestBody MatchScoreRequest request) {
        if (request.getUser1() == null || request.getUser2() == null) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "user1 and user2 are required"));
        }
        try {
            MatchScoreResponse result = matchScoreService.calculateScore(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Match score failed", "details", e.getMessage()));
        }
    }
}