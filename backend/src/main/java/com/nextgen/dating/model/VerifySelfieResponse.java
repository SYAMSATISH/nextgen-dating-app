package com.nextgen.dating.model;

public class VerifySelfieResponse {

    private boolean verified;
    private double similarity;
    private String confidence;
    private String message;

    public VerifySelfieResponse(boolean verified, double similarity, String confidence, String message) {
        this.verified = verified;
        this.similarity = similarity;
        this.confidence = confidence;
        this.message = message;
    }

    public boolean isVerified() { return verified; }
    public double getSimilarity() { return similarity; }
    public String getConfidence() { return confidence; }
    public String getMessage() { return message; }
}