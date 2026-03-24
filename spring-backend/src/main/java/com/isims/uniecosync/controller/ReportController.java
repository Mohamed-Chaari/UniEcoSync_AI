package com.isims.uniecosync.controller;

import com.isims.uniecosync.dto.IssueResponse;
import com.isims.uniecosync.service.ReportService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/issues")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @PostMapping("/analyze")
    public ResponseEntity<IssueResponse> analyzeIssue(
            @RequestParam("image") MultipartFile image,
            @RequestParam("description") String description,
            @RequestParam("student_id") String studentId) {

        try {
            IssueResponse response = reportService.processIssue(image, description, studentId);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(
                    new IssueResponse("error", "Failed to process issue", 0)
            );
        }
    }
}
