
package com.asrplatform.backend.repository;

import com.asrplatform.backend.entity.ReviewDecision;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewDecisionRepository
        extends JpaRepository<ReviewDecision, Long> {

    List<ReviewDecision> findByFilenameOrderBySegmentIndexAsc(
            String filename
    );
}
