package com.nextgen.dating.controller;

import com.nextgen.dating.model.ReportRequest;
import com.nextgen.dating.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @PostMapping("/report-user")
    public ResponseEntity<?> reportUser(@RequestBody ReportRequest request) {
        if (request.getReporterId() == null ||
            request.getReportedUserId() == null ||
            request.getReason() == null) {
            return ResponseEntity.badRequest()
                .body(Map.of("error", "reporterId, reportedUserId and reason are required"));
        }
        try {
            String reportId = reportService.saveReport(request);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "Report submitted successfully",
                "reportId", reportId
            ));
        } catch (Exception e) {
            return ResponseEntity.status(500)
                .body(Map.of("error", "Report failed", "details", e.getMessage()));
        }
    }
}