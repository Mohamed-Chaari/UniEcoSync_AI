package com.isims.uniecosync.service;

import com.isims.uniecosync.dto.IssueResponse;
import com.isims.uniecosync.model.EcoIssue;
import com.isims.uniecosync.repository.EcoIssueRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.logging.Logger;

@Service
public class ReportService {

    private static final Logger LOGGER = Logger.getLogger(ReportService.class.getName());

    @Value("${gemini.api.key}")
    private String geminiApiKey;

    private final EcoIssueRepository ecoIssueRepository;

    public ReportService(EcoIssueRepository ecoIssueRepository) {
        this.ecoIssueRepository = ecoIssueRepository;
    }

    public IssueResponse processIssue(MultipartFile image, String description, String studentId) {
        // 1. Log or process the uploaded file (simulate saving)
        String originalFilename = image.getOriginalFilename();
        LOGGER.info("Received file: " + originalFilename + " from student: " + studentId);
        LOGGER.info("Description: " + description);

        // 2. Simulate AI Processing using the Gemini API (Placeholder for now)
        LOGGER.info("Using Gemini API Key (mock): " + geminiApiKey);
        String simulatedAiCategory = "infrastructure_anomaly";
        int simulatedEcoPoints = 5;

        // 3. Save to In-Memory H2 Database
        EcoIssue issue = new EcoIssue(description, studentId, originalFilename, simulatedAiCategory);
        ecoIssueRepository.save(issue);
        LOGGER.info("Saved EcoIssue with ID: " + issue.getId() + " to the database.");

        // 4. Return the Response DTO expected by Android
        return new IssueResponse("success", simulatedAiCategory, simulatedEcoPoints);
    }
}
