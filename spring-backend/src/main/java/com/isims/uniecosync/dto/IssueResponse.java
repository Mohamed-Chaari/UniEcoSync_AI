package com.isims.uniecosync.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record IssueResponse(
    @JsonProperty("status") String status,
    @JsonProperty("ai_category") String aiCategory,
    @JsonProperty("eco_points_awarded") int ecoPointsAwarded
) {
}
