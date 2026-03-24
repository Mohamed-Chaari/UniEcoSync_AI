package com.isims.uniecosync.network;

import com.google.gson.annotations.SerializedName;

public class IssueResponse {
    @SerializedName("status")
    private String status;

    @SerializedName("ai_category")
    private String aiCategory;

    @SerializedName("eco_points_awarded")
    private int ecoPointsAwarded;

    @SerializedName("message")
    private String message;

    // Getters
    public String getStatus() { return status; }
    public String getAiCategory() { return aiCategory; }
    public int getEcoPointsAwarded() { return ecoPointsAwarded; }
    public String getMessage() { return message; }

    // Setters
    public void setStatus(String status) { this.status = status; }
    public void setAiCategory(String aiCategory) { this.aiCategory = aiCategory; }
    public void setEcoPointsAwarded(int ecoPointsAwarded) { this.ecoPointsAwarded = ecoPointsAwarded; }
    public void setMessage(String message) { this.message = message; }
}
