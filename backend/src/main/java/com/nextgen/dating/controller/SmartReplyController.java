package com.nextgen.dating.controller;

import com.nextgen.dating.model.SmartReplyRequest;
import com.nextgen.dating.model.SmartReplyResponse;
import com.nextgen.dating.service.SmartReplyService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class SmartReplyController {

    private final SmartReplyService smartReplyService;

    public SmartReplyController(SmartReplyService smartReplyService) {
        this.smartReplyService = smartReplyService;
    }

    @PostMapping("/smart-reply")
    public ResponseEntity<SmartReplyResponse> getSmartReplies(
            @Valid @RequestBody SmartReplyRequest request) {
        SmartReplyResponse response = smartReplyService.generateReplies(request);
        if (!response.isSuccess()) return ResponseEntity.internalServerError().body(response);
        return ResponseEntity.ok(response);
    }
}
