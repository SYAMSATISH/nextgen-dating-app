package com.nextgen.dating.controller;

import com.nextgen.dating.model.*;
import com.nextgen.dating.service.IcebreakerService;
import com.nextgen.dating.service.NudgeService;
import com.nextgen.dating.service.SmartReplyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class ConversationController {

    private final IcebreakerService icebreakerService;
    private final SmartReplyService smartReplyService;
    private final NudgeService nudgeService;

    public ConversationController(
            IcebreakerService icebreakerService,
            SmartReplyService smartReplyService,
            NudgeService nudgeService) {
        this.icebreakerService = icebreakerService;
        this.smartReplyService = smartReplyService;
        this.nudgeService = nudgeService;
    }

    // @PostMapping("/icebreakers")
    // public ResponseEntity<IcebreakerResponse> generateIcebreakers(
    //         @Valid @RequestBody IcebreakerRequest request) {
    //     IcebreakerResponse response = icebreakerService.generateIcebreakers(request);
    //     if (!response.isSuccess()) return ResponseEntity.internalServerError().body(response);
    //     return ResponseEntity.ok(response);
    // }

    @PostMapping("/smart-reply")
    public ResponseEntity<SmartReplyResponse> getSmartReplies(
            @Valid @RequestBody SmartReplyRequest request) {
        SmartReplyResponse response = smartReplyService.generateReplies(request);
        if (!response.isSuccess()) return ResponseEntity.internalServerError().body(response);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/nudge-check")
    public ResponseEntity<NudgeCheckResponse> checkNudge(
            @Valid @RequestBody NudgeCheckRequest request) {
        NudgeCheckResponse response = nudgeService.checkNudge(request);
        if (!response.isSuccess()) return ResponseEntity.internalServerError().body(response);
        return ResponseEntity.ok(response);
    }
}
