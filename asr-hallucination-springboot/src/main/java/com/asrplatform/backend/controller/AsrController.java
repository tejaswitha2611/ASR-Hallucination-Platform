
package com.asrplatform.backend.controller;

import com.asrplatform.backend.dto.AnalyzeRequest;
import com.asrplatform.backend.dto.TranscriptionAnalysis;
import com.asrplatform.backend.entity.ReviewDecision;
import com.asrplatform.backend.entity.TranscriptionRun;
import com.asrplatform.backend.repository.BenchmarkRunRepository;
import com.asrplatform.backend.repository.TranscriptionRunRepository;
import com.asrplatform.backend.repository.ReviewDecisionRepository;
import com.asrplatform.backend.service.AnalysisService;

import jakarta.validation.Valid;

import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.Optional;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = {
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174"
})
public class AsrController {

    private final AnalysisService analysisService;
    private final BenchmarkRunRepository repository;
    private final TranscriptionRunRepository transcriptionRepository;
    private final ReviewDecisionRepository reviewDecisionRepository;

    public AsrController(
            AnalysisService analysisService,
            BenchmarkRunRepository repository,
            TranscriptionRunRepository transcriptionRepository,
            ReviewDecisionRepository reviewDecisionRepository) {

        this.analysisService = analysisService;
        this.repository = repository;
        this.transcriptionRepository = transcriptionRepository;
        this.reviewDecisionRepository = reviewDecisionRepository;
    }

    // --------------------------------------------------
    // 1. HEALTH CHECK
    // --------------------------------------------------

    @GetMapping("/health")
    public Map<String, String> health() {
        return Map.of(
                "status", "UP",
                "application", "ASR Hallucination Backend"
        );
    }

    // --------------------------------------------------
    // 2. EXISTING TEXT ANALYSIS
    // --------------------------------------------------

    @PostMapping(
            value = "/analyze",
            consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public TranscriptionAnalysis analyze(
            @Valid @RequestBody AnalyzeRequest request) {

        return analysisService.analyze(request);
    }

    // --------------------------------------------------
    // 3. EXISTING WER BENCHMARK
    // --------------------------------------------------

    @PostMapping(
            value = "/benchmark/text",
            consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public Map<String, Object> benchmark(
            @RequestBody Map<String, String> request) {

        String reference = request.getOrDefault("referenceText", "");
        String hypothesis = request.getOrDefault("hypothesisText", "");

        if (reference.isBlank() || hypothesis.isBlank()) {
            throw new IllegalArgumentException(
                    "referenceText and hypothesisText are required"
            );
        }

        return analysisService.benchmark(reference, hypothesis);
    }

    // --------------------------------------------------
    // 4. UPLOAD NEW AUDIO, TRANSCRIBE AND ANALYZE
    // --------------------------------------------------

    @PostMapping(
            value = "/transcribe",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> transcribe(
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "detail",
                            "Please upload a non-empty audio file."
                    ));
        }

        String filename = file.getOriginalFilename();

        if (filename == null ||
                !filename.toLowerCase().matches(
                        ".*\\.(mp3|wav|m4a|flac|ogg|webm)$")) {

            return ResponseEntity.badRequest()
                    .body(Map.of(
                            "detail",
                            "Unsupported audio format. Use MP3, WAV, M4A, FLAC, OGG, or WEBM."
                    ));
        }

        if (file.getSize() > 50L * 1024 * 1024) {
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                    .body(Map.of(
                            "detail",
                            "Maximum audio size is 50 MB."
                    ));
        }

        // Prevent duplicate audio processing
        if (transcriptionRepository.existsByFilename(filename)) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "status", "DUPLICATE",
                            "filename", filename,
                            "detail",
                            "This audio file has already been processed."
                    ));
        }

        try {
            RestTemplate restTemplate = new RestTemplate();

            MultiValueMap<String, Object> body =
                    new LinkedMultiValueMap<>();

            ByteArrayResource audio = new ByteArrayResource(
                    file.getBytes()) {

                @Override
                public String getFilename() {
                    return filename;
                }
            };

            body.add("file", audio);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> request =
                    new HttpEntity<>(body, headers);

            ResponseEntity<Map> response =
                    restTemplate.postForEntity(
                            "http://localhost:8001/transcribe",
                            request,
                            Map.class
                    );

            Map<String, Object> transcription = response.getBody();

            if (transcription == null) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(Map.of(
                                "detail",
                                "Python Whisper returned an empty response."
                        ));
            }

            Map<String, Object> analysisResult =
                    analysisService.analyzeTranscription(transcription);

            return ResponseEntity.ok(analysisResult);

        } catch (RestClientException ex) {

            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of(
                            "detail",
                            "Could not complete transcription. Check that Python Whisper is running on port 8001."
                    ));

        } catch (IOException ex) {

            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "detail",
                            "Could not read the uploaded audio file."
                    ));
        }
    }

    // --------------------------------------------------
    // 5. REPROCESS EXISTING AUDIO USING DATABASE ID
    // --------------------------------------------------

    @PostMapping(
            value = "/reprocess/{id}",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<?> reprocess(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file) {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of(
                    "detail",
                    "Please upload a non-empty audio file."
            ));
        }

        String filename = file.getOriginalFilename();

        if (filename == null ||
                !filename.toLowerCase().matches(
                        ".*\\.(mp3|wav|m4a|flac|ogg|webm)$")) {

            return ResponseEntity.badRequest().body(Map.of(
                    "detail",
                    "Unsupported audio format. Use MP3, WAV, M4A, FLAC, OGG, or WEBM."
            ));
        }

        if (file.getSize() > 50L * 1024 * 1024) {
            return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE)
                    .body(Map.of(
                            "detail",
                            "Maximum audio size is 50 MB."
                    ));
        }

        // Find the exact database record using its ID
        Optional<TranscriptionRun> existingOptional =
                transcriptionRepository.findById(id);

        if (existingOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "status", "NOT_FOUND",
                            "id", id,
                            "detail",
                            "No transcription record found for this ID."
                    ));
        }

        TranscriptionRun existingRun = existingOptional.get();

        // Verify uploaded filename matches the selected record
        if (!existingRun.getFilename().equals(filename)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "status", "FILENAME_MISMATCH",
                    "id", id,
                    "expectedFilename", existingRun.getFilename(),
                    "uploadedFilename", filename,
                    "detail",
                    "Uploaded filename does not match the selected database record."
            ));
        }

        // Never overwrite an existing non-empty transcript
        if (existingRun.getTranscript() != null &&
                !existingRun.getTranscript().isBlank()) {

            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body(Map.of(
                            "status", "NOT_EMPTY",
                            "id", id,
                            "filename", filename,
                            "detail",
                            "This record already has a transcript."
                    ));
        }

        try {
            RestTemplate restTemplate = new RestTemplate();

            MultiValueMap<String, Object> body =
                    new LinkedMultiValueMap<>();

            ByteArrayResource audio = new ByteArrayResource(
                    file.getBytes()) {

                @Override
                public String getFilename() {
                    return filename;
                }
            };

            body.add("file", audio);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.MULTIPART_FORM_DATA);

            HttpEntity<MultiValueMap<String, Object>> request =
                    new HttpEntity<>(body, headers);

            ResponseEntity<Map> response =
                    restTemplate.postForEntity(
                            "http://localhost:8001/transcribe",
                            request,
                            Map.class
                    );

            Map<String, Object> transcription = response.getBody();

            if (transcription == null) {
                return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                        .body(Map.of(
                                "detail",
                                "Python Whisper returned an empty response. Existing record was not changed."
                        ));
            }

            // Reject empty transcripts
            Object transcriptValue = transcription.get("transcript");

            String recoveredTranscript =
                    transcriptValue instanceof String
                            ? ((String) transcriptValue).trim()
                            : "";

            if (recoveredTranscript.isEmpty()) {
                return ResponseEntity.status(
                        HttpStatus.UNPROCESSABLE_ENTITY
                ).body(Map.of(
                        "status", "REPROCESS_FAILED",
                        "detail",
                        "Whisper returned an empty transcript. Existing database record was not changed.",
                        "id", id,
                        "filename", filename
                ));
            }

            // Preserve the original database filename
            transcription.put("filename", filename);

            // Update the exact existing database record
            Map<String, Object> result =
                    analysisService.analyzeTranscription(
                            transcription,
                            existingRun
                    );

            return ResponseEntity.ok(result);

        } catch (RestClientException ex) {

            return ResponseEntity.status(HttpStatus.BAD_GATEWAY)
                    .body(Map.of(
                            "detail",
                            "Could not complete reprocessing. Check that Python Whisper is running on port 8001. Existing record was not changed."
                    ));

        } catch (IOException ex) {

            return ResponseEntity.internalServerError()
                    .body(Map.of(
                            "detail",
                            "Could not read the uploaded audio file. Existing record was not changed."
                    ));
        }
    }

    // --------------------------------------------------
    // 6. RETRIEVE TEXT BENCHMARK RUNS
    // --------------------------------------------------

    @GetMapping("/runs")
    public Object runs() {
        return repository.findAll();
    }

    // --------------------------------------------------
    // 7. RETRIEVE AUDIO TRANSCRIPTION HISTORY
    // --------------------------------------------------

    @GetMapping("/transcription-runs")
    public Object transcriptionRuns() {
        return transcriptionRepository.findAll();
    }

    // --------------------------------------------------
    // 8. RETRIEVE SAVED SEGMENTS BY TRANSCRIPTION ID
    // --------------------------------------------------

    @GetMapping("/transcription-runs/{id}/segments")
    public ResponseEntity<?> getTranscriptionSegments(
            @PathVariable Long id) {

        Optional<TranscriptionRun> optionalRun =
                transcriptionRepository.findById(id);

        if (optionalRun.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "detail",
                            "Transcription record not found."
                    ));
        }

        TranscriptionRun run = optionalRun.get();

        String segmentsJson = run.getSegmentsJson();

        if (segmentsJson == null || segmentsJson.isBlank()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of(
                            "detail",
                            "No saved segment data exists for this recording. It may need to be reprocessed."
                    ));
        }

        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_JSON)
                .body(segmentsJson);
    }

    // --------------------------------------------------
    // 9. SAVE HUMAN REVIEW DECISION
    // --------------------------------------------------

    @PostMapping(
            value = "/review-decisions",
            consumes = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<?> saveReviewDecision(
            @RequestBody Map<String, Object> request) {

        String filename = request.get("filename") instanceof String
                ? (String) request.get("filename") : "";

        String segmentText = request.get("segmentText") instanceof String
                ? (String) request.get("segmentText") : "";

        String decision = request.get("decision") instanceof String
                ? (String) request.get("decision") : "";

        Object indexValue = request.get("segmentIndex");

        if (filename.isBlank() || segmentText.isBlank()
                || !(indexValue instanceof Number)) {

            return ResponseEntity.badRequest().body(Map.of(
                    "detail",
                    "filename, segmentIndex and segmentText are required."
            ));
        }

        int segmentIndex = ((Number) indexValue).intValue();

        if (segmentIndex < 0) {
            return ResponseEntity.badRequest().body(Map.of(
                    "detail",
                    "segmentIndex cannot be negative."
            ));
        }

        Set<String> allowedDecisions = Set.of(
                "Not reviewed",
                "Mark as correct",
                "Send for human review",
                "Request re-analysis"
        );

        if (!allowedDecisions.contains(decision)) {
            return ResponseEntity.badRequest().body(Map.of(
                    "detail",
                    "Invalid review decision."
            ));
        }

        ReviewDecision review = new ReviewDecision(
                filename,
                segmentIndex,
                segmentText,
                decision
        );

        ReviewDecision saved =
                reviewDecisionRepository.save(review);

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    // --------------------------------------------------
    // 10. RETRIEVE REVIEW DECISIONS
    // --------------------------------------------------

    @GetMapping("/review-decisions/{filename}")
    public List<ReviewDecision> getReviewDecisions(
            @PathVariable String filename) {

        return reviewDecisionRepository
                .findByFilenameOrderBySegmentIndexAsc(filename);
    }
}
