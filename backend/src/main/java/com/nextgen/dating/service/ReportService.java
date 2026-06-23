package com.nextgen.dating.service;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.nextgen.dating.model.ReportRequest;
import org.springframework.stereotype.Service;

import java.io.File;
import java.time.Instant;
import java.util.*;

@Service
public class ReportService {

    private final String reportsFile = "reports.json";
    private final ObjectMapper mapper = new ObjectMapper();

    public String saveReport(ReportRequest request) throws Exception {
        List<Map<String, Object>> reports = loadReports();

        String reportId = UUID.randomUUID().toString();

        Map<String, Object> report = new HashMap<>();
        report.put("id", reportId);
        report.put("reporterId", request.getReporterId());
        report.put("reportedUserId", request.getReportedUserId());
        report.put("reason", request.getReason());
        report.put("description", request.getDescription() != null ? request.getDescription() : "");
        report.put("status", "pending");
        report.put("createdAt", Instant.now().toString());

        reports.add(report);
        saveReports(reports);

        return reportId;
    }

    private List<Map<String, Object>> loadReports() throws Exception {
        File file = new File(reportsFile);
        if (!file.exists()) {
            return new ArrayList<>();
        }
        return mapper.readValue(file, new TypeReference<List<Map<String, Object>>>() {});
    }

    private void saveReports(List<Map<String, Object>> reports) throws Exception {
        mapper.writeValue(new File(reportsFile), reports);
    }
}