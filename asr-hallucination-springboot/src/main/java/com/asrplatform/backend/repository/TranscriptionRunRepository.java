package com.asrplatform.backend.repository;

import com.asrplatform.backend.entity.TranscriptionRun;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TranscriptionRunRepository
        extends JpaRepository<TranscriptionRun, Long> {

    // Check whether an audio file has already been processed
    boolean existsByFilename(String filename);
    Optional<TranscriptionRun> findByFilename(String filename);
}
