
package com.asrplatform.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "transcription_runs")
public class TranscriptionRun {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String filename;

    @Column(columnDefinition = "LONGTEXT")
    private String transcript;

    // Stores the original Whisper segment data and analysis.
    @Column(columnDefinition = "LONGTEXT")
    private String segmentsJson;

    private String language;

    private double languageProbability;
    private double avgLogprob;
    private double noSpeechProbability;
    private double compressionRatio;
    private double hallucinationRiskScore;

    private String riskLevel;
    private String gateStatus;

    @Column(columnDefinition = "TEXT")
    private String riskFlags;

    private LocalDateTime createdAt = LocalDateTime.now();

    public TranscriptionRun() {
    }

    public TranscriptionRun(
            String filename,
            String transcript,
            String language,
            double languageProbability,
            double avgLogprob,
            double noSpeechProbability,
            double compressionRatio,
            double hallucinationRiskScore,
            String riskLevel,
            String gateStatus,
            String riskFlags) {

        this.filename = filename;
        this.transcript = transcript;
        this.language = language;
        this.languageProbability = languageProbability;
        this.avgLogprob = avgLogprob;
        this.noSpeechProbability = noSpeechProbability;
        this.compressionRatio = compressionRatio;
        this.hallucinationRiskScore = hallucinationRiskScore;
        this.riskLevel = riskLevel;
        this.gateStatus = gateStatus;
        this.riskFlags = riskFlags;
    }

    public void updateTranscription(
            String transcript,
            String language,
            double languageProbability,
            double avgLogprob,
            double noSpeechProbability,
            double compressionRatio,
            double hallucinationRiskScore,
            String riskLevel,
            String gateStatus,
            String riskFlags) {

        this.transcript = transcript;
        this.language = language;
        this.languageProbability = languageProbability;
        this.avgLogprob = avgLogprob;
        this.noSpeechProbability = noSpeechProbability;
        this.compressionRatio = compressionRatio;
        this.hallucinationRiskScore = hallucinationRiskScore;
        this.riskLevel = riskLevel;
        this.gateStatus = gateStatus;
        this.riskFlags = riskFlags;
    }

    public void setSegmentsJson(String segmentsJson) {
        this.segmentsJson = segmentsJson;
    }

    public Long getId() { return id; }
    public String getFilename() { return filename; }
    public String getTranscript() { return transcript; }
    public String getSegmentsJson() { return segmentsJson; }
    public String getLanguage() { return language; }
    public double getLanguageProbability() { return languageProbability; }
    public double getAvgLogprob() { return avgLogprob; }
    public double getNoSpeechProbability() { return noSpeechProbability; }
    public double getCompressionRatio() { return compressionRatio; }
    public double getHallucinationRiskScore() { return hallucinationRiskScore; }
    public String getRiskLevel() { return riskLevel; }
    public String getGateStatus() { return gateStatus; }
    public String getRiskFlags() { return riskFlags; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
