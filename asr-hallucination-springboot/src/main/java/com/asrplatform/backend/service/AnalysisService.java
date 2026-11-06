
package com.asrplatform.backend.service;

import com.asrplatform.backend.dto.AnalyzeRequest;
import com.asrplatform.backend.dto.TranscriptionAnalysis;
import com.asrplatform.backend.entity.BenchmarkRun;
import com.asrplatform.backend.entity.TranscriptionRun;
import com.asrplatform.backend.repository.BenchmarkRunRepository;
import com.asrplatform.backend.repository.TranscriptionRunRepository;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;

@Service
public class AnalysisService {

    private static final double LOW_LOGPROB_THRESHOLD = -1.0;
    private static final double HIGH_NO_SPEECH_THRESHOLD = 0.50;
    private static final double HIGH_COMPRESSION_THRESHOLD = 2.40;
    private static final double HIGH_RISK_THRESHOLD = 0.50;

    private static final Pattern WORDS =
            Pattern.compile("[\\p{L}\\p{N}']+");

    private final BenchmarkRunRepository repository;
    private final TranscriptionRunRepository transcriptionRepository;
    private final ObjectMapper objectMapper;

    public AnalysisService(
            BenchmarkRunRepository repository,
            TranscriptionRunRepository transcriptionRepository,
            ObjectMapper objectMapper) {

        this.repository = repository;
        this.transcriptionRepository = transcriptionRepository;
        this.objectMapper = objectMapper;
    }

    // --------------------------------------------------
    // 1. WORD ERROR RATE (WER) BENCHMARK
    // --------------------------------------------------

    public Map<String, Object> benchmark(
            String reference,
            String hypothesis) {

        List<String> ref = normalize(reference);
        List<String> hyp = normalize(hypothesis);

        int[][] dp = new int[ref.size() + 1][hyp.size() + 1];

        for (int i = 0; i <= ref.size(); i++) {
            dp[i][0] = i;
        }

        for (int j = 0; j <= hyp.size(); j++) {
            dp[0][j] = j;
        }

        for (int i = 1; i <= ref.size(); i++) {
            for (int j = 1; j <= hyp.size(); j++) {

                int cost = ref.get(i - 1).equals(hyp.get(j - 1))
                        ? 0 : 1;

                dp[i][j] = Math.min(
                        Math.min(
                                dp[i - 1][j] + 1,
                                dp[i][j - 1] + 1
                        ),
                        dp[i - 1][j - 1] + cost
                );
            }
        }

        int i = ref.size();
        int j = hyp.size();

        int substitutions = 0;
        int deletions = 0;
        int insertions = 0;
        int correct = 0;

        while (i > 0 || j > 0) {

            if (i > 0 && j > 0
                    && ref.get(i - 1).equals(hyp.get(j - 1))
                    && dp[i][j] == dp[i - 1][j - 1]) {

                correct++;
                i--;
                j--;

            } else if (i > 0 && j > 0
                    && dp[i][j] == dp[i - 1][j - 1] + 1) {

                substitutions++;
                i--;
                j--;

            } else if (i > 0
                    && dp[i][j] == dp[i - 1][j] + 1) {

                deletions++;
                i--;

            } else if (j > 0) {

                insertions++;
                j--;
            }
        }

        double wer = ref.isEmpty()
                ? (hyp.isEmpty() ? 0.0 : 1.0)
                : (double) (substitutions + deletions + insertions)
                    / ref.size();

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("wer", round(wer, 6));
        result.put("werPercent", round(wer * 100, 2));
        result.put("referenceWordCount", ref.size());
        result.put("hypothesisWordCount", hyp.size());
        result.put("correctWords", correct);
        result.put("substitutions", substitutions);
        result.put("deletions", deletions);
        result.put("insertions", insertions);

        return result;
    }

    // --------------------------------------------------
    // 2. TEXT-BASED ANALYSIS
    // --------------------------------------------------

    public TranscriptionAnalysis analyze(AnalyzeRequest request) {

        String text = request.getHypothesisText() == null
                ? "" : request.getHypothesisText().trim();

        List<String> flags = new ArrayList<>();
        List<String> words = normalize(text);

        if (text.isBlank()) {
            flags.add("empty_transcript");
        }

        if (request.getConfidence() < request.getConfidenceThreshold()) {
            flags.add("below_confidence_threshold");
        }

        if (hasRepeatedNgram(words, 3)) {
            flags.add("repeated_three_word_phrase");
        }

        double risk = Math.min(1.0, flags.size() * 0.30);

        boolean highRisk = risk >= 0.60
                || flags.contains("empty_transcript");

        String level = highRisk
                ? "HIGH"
                : (flags.isEmpty() ? "LOW" : "MEDIUM");

        boolean accepted =
                request.getConfidence() >= request.getConfidenceThreshold()
                        && !highRisk;

        String gate = accepted
                ? "ACCEPTED"
                : "REVIEW_REQUIRED";

        Map<String, Object> metrics = benchmark(
                request.getReferenceText(),
                request.getHypothesisText()
        );

        repository.save(new BenchmarkRun(
                request.getReferenceText(),
                request.getHypothesisText(),
                ((Number) metrics.get("wer")).doubleValue(),
                (Integer) metrics.get("substitutions"),
                (Integer) metrics.get("deletions"),
                (Integer) metrics.get("insertions"),
                request.getConfidence(),
                gate,
                level,
                String.join(",", flags)
        ));

        return new TranscriptionAnalysis(
                accepted ? text : null,
                request.getConfidence(),
                request.getConfidenceThreshold(),
                accepted,
                gate,
                round(risk, 4),
                level,
                flags,
                "Baseline heuristic only; it is not a validated hallucination classifier."
        );
    }

    // --------------------------------------------------
    // 3. AUDIO TRANSCRIPTION ANALYSIS
    // --------------------------------------------------

    public Map<String, Object> analyzeTranscription(
            Map<String, Object> transcription) {

        return analyzeTranscription(transcription, null);
    }

    public Map<String, Object> analyzeTranscription(
            Map<String, Object> transcription,
            TranscriptionRun existingRun) {

        String filename = stringValue(
                transcription.get("filename"), "unknown");

        String transcript = stringValue(
                transcription.get("transcript"), "");

        String language = stringValue(
                transcription.get("language"), "unknown");

        double languageProbability = getNumber(
                transcription.get("language_probability"), 0.0);

        // ----------------------------------------------
        // AUDIO QUALITY INFORMATION
        // ----------------------------------------------

        Object audioQualityObject = transcription.get("audio_quality");

        Map<?, ?> audioQuality = audioQualityObject instanceof Map
                ? (Map<?, ?>) audioQualityObject
                : Collections.emptyMap();

        String audioQualityStatus = stringValue(
                audioQuality.get("status"), "UNAVAILABLE");

        double meanVolume = getNumber(
                audioQuality.get("mean_volume_db"), Double.NaN);

        double maxVolume = getNumber(
                audioQuality.get("max_volume_db"), Double.NaN);

        boolean nearSilent =
                "NEAR_SILENT".equalsIgnoreCase(audioQualityStatus);

        boolean lowSignal =
                "LOW_SIGNAL".equalsIgnoreCase(audioQualityStatus);

        // ----------------------------------------------
        // OVERALL FLAGS
        // ----------------------------------------------

        List<String> overallFlags = new ArrayList<>();
        List<String> words = normalize(transcript);

        if (transcript.isBlank()) {
            overallFlags.add("empty_transcript");
        }

        if (!transcript.isBlank() && words.isEmpty()) {
            overallFlags.add("punctuation_only_transcript");
        }

        if (nearSilent) {
            overallFlags.add("near_silent_audio");
        }

        if (lowSignal) {
            overallFlags.add("low_audio_signal");
        }

        // ----------------------------------------------
        // SEGMENT ANALYSIS
        // ----------------------------------------------

        Object segmentObject = transcription.get("segments");

        List<?> segments = segmentObject instanceof List
                ? (List<?>) segmentObject
                : Collections.emptyList();

        List<Map<String, Object>> analyzedSegments =
                new ArrayList<>();

        List<Double> segmentRiskScores = new ArrayList<>();

        double totalLogprob = 0.0;
        double totalNoSpeech = 0.0;
        double totalCompression = 0.0;

        int logprobCount = 0;
        int noSpeechCount = 0;
        int compressionCount = 0;

        for (int index = 0; index < segments.size(); index++) {

            Object item = segments.get(index);

            if (!(item instanceof Map)) {
                continue;
            }

            Map<?, ?> segment = (Map<?, ?>) item;

            Double logprob = getNullableNumber(
                    segment.get("avg_logprob"));

            Double noSpeech = getNullableNumber(
                    segment.get("no_speech_prob"));

            Double compression = getNullableNumber(
                    segment.get("compression_ratio"));

            List<String> segmentFlags = new ArrayList<>();

            if (logprob != null) {

                totalLogprob += logprob;
                logprobCount++;

                if (logprob < LOW_LOGPROB_THRESHOLD) {
                    segmentFlags.add(
                            "low_average_log_probability");
                }
            }

            if (noSpeech != null) {

                totalNoSpeech += noSpeech;
                noSpeechCount++;

                if (noSpeech > HIGH_NO_SPEECH_THRESHOLD) {
                    segmentFlags.add(
                            "high_no_speech_probability");
                }
            }

            if (compression != null) {

                totalCompression += compression;
                compressionCount++;

                if (compression > HIGH_COMPRESSION_THRESHOLD) {
                    segmentFlags.add(
                            "high_compression_ratio");
                }
            }

            int availableMetrics =
                    (logprob == null ? 0 : 1)
                    + (noSpeech == null ? 0 : 1)
                    + (compression == null ? 0 : 1);

            double segmentRisk = availableMetrics == 0
                    ? 0.0
                    : (double) segmentFlags.size() / availableMetrics;

            String segmentLevel = riskLevel(segmentRisk);

            Map<String, Object> analyzed = new LinkedHashMap<>();

            analyzed.put("segmentIndex", index);
            analyzed.put("start", segment.get("start"));
            analyzed.put("end", segment.get("end"));
            analyzed.put("text", segment.get("text"));
            analyzed.put("avg_logprob", logprob);
            analyzed.put("no_speech_prob", noSpeech);
            analyzed.put("compression_ratio", compression);
            analyzed.put("availableMetricCount", availableMetrics);
            analyzed.put("riskScore", round(segmentRisk, 4));
            analyzed.put("riskLevel", segmentLevel);
            analyzed.put("riskFlags", segmentFlags);
            analyzed.put("metricsAvailable", availableMetrics > 0);

            analyzedSegments.add(analyzed);

            if (availableMetrics > 0) {
                segmentRiskScores.add(segmentRisk);
            }

            for (String flag : segmentFlags) {
                if (!overallFlags.contains(flag)) {
                    overallFlags.add(flag);
                }
            }
        }

        // ----------------------------------------------
        // AVERAGE METRICS
        // ----------------------------------------------

        double avgLogprob = logprobCount == 0
                ? 0.0 : totalLogprob / logprobCount;

        double avgNoSpeech = noSpeechCount == 0
                ? 0.0 : totalNoSpeech / noSpeechCount;

        double avgCompression = compressionCount == 0
                ? 0.0 : totalCompression / compressionCount;

        if (segments.isEmpty() || segmentRiskScores.isEmpty()) {

            if (!transcript.isBlank()
                    && !overallFlags.contains(
                            "segment_metrics_unavailable")) {

                overallFlags.add("segment_metrics_unavailable");
            }
        }

        if (hasRepeatedNgram(words, 3)) {
            overallFlags.add("repeated_three_word_phrase");
        }

        // ----------------------------------------------
        // OVERALL RISK CALCULATION
        // ----------------------------------------------

        double risk = segmentRiskScores.isEmpty()
                ? 0.0
                : segmentRiskScores.stream()
                    .mapToDouble(Double::doubleValue)
                    .average()
                    .orElse(0.0);

        if (overallFlags.contains("repeated_three_word_phrase")) {
            risk = Math.min(1.0, risk + 0.15);
        }

        if (transcript.isBlank()
                || overallFlags.contains("punctuation_only_transcript")) {

            risk = 1.0;
        }

        if (nearSilent) {
            risk = 1.0;
        }

        if (lowSignal) {
            risk = Math.max(risk, HIGH_RISK_THRESHOLD);
        }

        risk = round(risk, 4);

        String level = risk >= HIGH_RISK_THRESHOLD
                ? "HIGH"
                : risk > 0.0 ? "MEDIUM" : "LOW";

        boolean metricsUnavailable =
                segmentRiskScores.isEmpty() && !transcript.isBlank();

        // ----------------------------------------------
        // CONFIDENCE GATE
        // ----------------------------------------------

        boolean forcedReview =
                nearSilent
                || lowSignal
                || transcript.isBlank()
                || overallFlags.contains("punctuation_only_transcript");

        String gate = !forcedReview
                && "LOW".equals(level)
                && !metricsUnavailable
                ? "ACCEPTED"
                : "REVIEW_REQUIRED";

        // ----------------------------------------------
        // SAVE NEW RECORD OR UPDATE EXISTING RECORD
        // ----------------------------------------------

        TranscriptionRun savedRun;

        if (existingRun == null) {

            savedRun = new TranscriptionRun(
                    filename,
                    transcript,
                    language,
                    languageProbability,
                    avgLogprob,
                    avgNoSpeech,
                    avgCompression,
                    risk,
                    level,
                    gate,
                    String.join(",", overallFlags)
            );

        } else {

            existingRun.updateTranscription(
                    transcript,
                    language,
                    languageProbability,
                    avgLogprob,
                    avgNoSpeech,
                    avgCompression,
                    risk,
                    level,
                    gate,
                    String.join(",", overallFlags)
            );

            savedRun = existingRun;
        }

        // ----------------------------------------------
        // PERSIST ORIGINAL SEGMENTS AND THEIR ANALYSIS
        // ----------------------------------------------

        Map<String, Object> segmentData = new LinkedHashMap<>();

        segmentData.put("segments", segments);
        segmentData.put("segmentAnalysis", analyzedSegments);

        try {

            savedRun.setSegmentsJson(
                    objectMapper.writeValueAsString(segmentData)
            );

        } catch (JsonProcessingException ex) {

            throw new IllegalStateException(
                    "Could not save transcription segments.", ex);
        }

        savedRun = transcriptionRepository.save(savedRun);

        // ----------------------------------------------
        // BUILD ANALYSIS RESPONSE
        // ----------------------------------------------

        Map<String, Object> analysis = new LinkedHashMap<>();

        analysis.put("hallucinationRiskScore", risk);
        analysis.put("riskLevel", level);
        analysis.put("gateStatus", gate);
        analysis.put("riskFlags", overallFlags);

        analysis.put("audioQualityStatus", audioQualityStatus);
        analysis.put("meanVolumeDb",
                Double.isFinite(meanVolume) ? meanVolume : null);
        analysis.put("maxVolumeDb",
                Double.isFinite(maxVolume) ? maxVolume : null);

        analysis.put("nearSilentAudio", nearSilent);
        analysis.put("lowSignalAudio", lowSignal);

        analysis.put(
                "averageLogProbability",
                round(avgLogprob, 4));

        analysis.put(
                "averageNoSpeechProbability",
                round(avgNoSpeech, 4));

        analysis.put(
                "averageCompressionRatio",
                round(avgCompression, 4));

        analysis.put(
                "segmentMetricsAvailable",
                !metricsUnavailable);

        analysis.put(
                "note",
                "Preliminary rule-based indicators only. "
                + "Audio volume and Whisper metrics are warning "
                + "signals, not proof of hallucination. "
                + "Validate against labeled reference data and "
                + "manual listening.");

        // ----------------------------------------------
        // BUILD FINAL RESPONSE
        // ----------------------------------------------

        Map<String, Object> result = new LinkedHashMap<>();

        result.put("id", savedRun.getId());
        result.put("filename", filename);
        result.put("language", language);
        result.put("language_probability", languageProbability);
        result.put("transcript", transcript);
        result.put("total_segments", segments.size());
        result.put("segments", segments);
        result.put("segmentAnalysis", analyzedSegments);
        result.put("audio_quality", audioQuality);
        result.put("analysis", analysis);

        return result;
    }

    // --------------------------------------------------
    // 4. HELPER METHODS
    // --------------------------------------------------

    private Double getNullableNumber(Object value) {

        if (value instanceof Number) {

            double number = ((Number) value).doubleValue();

            return Double.isFinite(number) ? number : null;
        }

        return null;
    }

    private double getNumber(Object value, double fallback) {

        Double number = getNullableNumber(value);

        return number == null ? fallback : number;
    }

    private String stringValue(Object value, String fallback) {

        return value == null
                ? fallback
                : String.valueOf(value);
    }

    private String riskLevel(double score) {

        if (score >= HIGH_RISK_THRESHOLD) {
            return "HIGH";
        }

        if (score > 0.0) {
            return "MEDIUM";
        }

        return "LOW";
    }

    private List<String> normalize(String text) {

        var matcher = WORDS.matcher(
                text == null ? "" : text.toLowerCase(Locale.ROOT));

        List<String> out = new ArrayList<>();

        while (matcher.find()) {
            out.add(matcher.group());
        }

        return out;
    }

    private boolean hasRepeatedNgram(List<String> words, int n) {

        Set<String> seen = new HashSet<>();

        for (int i = 0; i + n <= words.size(); i++) {

            String phrase = String.join(
                    " ",
                    words.subList(i, i + n));

            if (!seen.add(phrase)) {
                return true;
            }
        }

        return false;
    }

    private double round(double value, int places) {

        double scale = Math.pow(10, places);

        return Math.round(value * scale) / scale;
    }
}
