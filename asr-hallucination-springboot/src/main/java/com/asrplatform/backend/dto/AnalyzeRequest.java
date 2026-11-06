package com.asrplatform.backend.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class AnalyzeRequest {
    @NotBlank private String referenceText;
    @NotBlank private String hypothesisText;
    @NotNull @DecimalMin("0.0") @DecimalMax("1.0") private Double confidence;
    @DecimalMin("0.0") @DecimalMax("1.0") private Double confidenceThreshold = 0.55;

    public String getReferenceText() { return referenceText; }
    public void setReferenceText(String referenceText) { this.referenceText = referenceText; }
    public String getHypothesisText() { return hypothesisText; }
    public void setHypothesisText(String hypothesisText) { this.hypothesisText = hypothesisText; }
    public Double getConfidence() { return confidence; }
    public void setConfidence(Double confidence) { this.confidence = confidence; }
    public Double getConfidenceThreshold() { return confidenceThreshold == null ? 0.55 : confidenceThreshold; }
    public void setConfidenceThreshold(Double confidenceThreshold) { this.confidenceThreshold = confidenceThreshold; }
}
