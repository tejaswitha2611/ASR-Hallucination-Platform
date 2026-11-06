package com.asrplatform.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "benchmark_runs")
public class BenchmarkRun {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String referenceText;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String hypothesisText;

    private double wer;
    private int substitutions;
    private int deletions;
    private int insertions;
    private double confidence;
    private String gateStatus;
    private String riskLevel;

    @Column(columnDefinition = "TEXT")
    private String riskFlags;

    private LocalDateTime createdAt = LocalDateTime.now();

    public BenchmarkRun() {}

    public BenchmarkRun(String referenceText, String hypothesisText, double wer,
                        int substitutions, int deletions, int insertions,
                        double confidence, String gateStatus, String riskLevel, String riskFlags) {
        this.referenceText = referenceText;
        this.hypothesisText = hypothesisText;
        this.wer = wer;
        this.substitutions = substitutions;
        this.deletions = deletions;
        this.insertions = insertions;
        this.confidence = confidence;
        this.gateStatus = gateStatus;
        this.riskLevel = riskLevel;
        this.riskFlags = riskFlags;
    }

    public Long getId() { return id; }
    public String getReferenceText() { return referenceText; }
    public String getHypothesisText() { return hypothesisText; }
    public double getWer() { return wer; }
    public int getSubstitutions() { return substitutions; }
    public int getDeletions() { return deletions; }
    public int getInsertions() { return insertions; }
    public double getConfidence() { return confidence; }
    public String getGateStatus() { return gateStatus; }
    public String getRiskLevel() { return riskLevel; }
    public String getRiskFlags() { return riskFlags; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
