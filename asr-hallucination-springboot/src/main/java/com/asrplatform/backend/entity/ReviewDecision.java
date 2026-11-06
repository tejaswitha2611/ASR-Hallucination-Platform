
package com.asrplatform.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "review_decisions")
public class ReviewDecision {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String filename;

    private int segmentIndex;

    @Column(columnDefinition = "TEXT")
    private String segmentText;

    private String decision;

    private LocalDateTime createdAt = LocalDateTime.now();

    public ReviewDecision() {
    }

    public ReviewDecision(
            String filename,
            int segmentIndex,
            String segmentText,
            String decision) {

        this.filename = filename;
        this.segmentIndex = segmentIndex;
        this.segmentText = segmentText;
        this.decision = decision;
    }

    public Long getId() {
        return id;
    }

    public String getFilename() {
        return filename;
    }

    public int getSegmentIndex() {
        return segmentIndex;
    }

    public String getSegmentText() {
        return segmentText;
    }

    public String getDecision() {
        return decision;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setDecision(String decision) {
        this.decision = decision;
    }
}
