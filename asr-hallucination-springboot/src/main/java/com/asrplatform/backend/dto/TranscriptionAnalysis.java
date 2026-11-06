package com.asrplatform.backend.dto;

import java.util.List;

public record TranscriptionAnalysis(
        String hypothesisText,
        double confidence,
        double confidenceThreshold,
        boolean acceptedAutomatically,
        String gateStatus,
        double hallucinationRiskScore,
        String riskLevel,
        List<String> riskFlags,
        String note
) {}
