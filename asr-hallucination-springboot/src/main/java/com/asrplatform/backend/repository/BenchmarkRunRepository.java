package com.asrplatform.backend.repository;

import com.asrplatform.backend.entity.BenchmarkRun;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BenchmarkRunRepository extends JpaRepository<BenchmarkRun, Long> {
}
