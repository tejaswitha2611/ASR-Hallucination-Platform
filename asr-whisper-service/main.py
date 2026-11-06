
from fastapi import FastAPI, UploadFile, File, HTTPException
from faster_whisper import WhisperModel
import os
import re
import subprocess
import tempfile

app = FastAPI(title="ASR Guard Transcription Service")

model = None

ALLOWED_EXTENSIONS = {
    ".mp3", ".wav", ".m4a", ".flac", ".ogg", ".webm"
}

MAX_FILE_SIZE = 50 * 1024 * 1024


# --------------------------------------------------
# AUDIO QUALITY ANALYSIS
# --------------------------------------------------

def measure_audio_quality(file_path):
    """Measure audio volume using FFmpeg."""

    try:
        result = subprocess.run(
            [
                "ffmpeg",
                "-hide_banner",
                "-i", file_path,
                "-af", "volumedetect",
                "-f", "null",
                "-"
            ],
            capture_output=True,
            text=True,
            timeout=60
        )

        output = result.stderr or ""

        mean_match = re.search(
            r"mean_volume:\s*(-inf|-?\d+(?:\.\d+)?)\s*dB",
            output
        )

        max_match = re.search(
            r"max_volume:\s*(-inf|-?\d+(?:\.\d+)?)\s*dB",
            output
        )

        if not mean_match or not max_match:
            return {
                "status": "UNAVAILABLE",
                "mean_volume_db": None,
                "max_volume_db": None,
                "message": "Audio volume measurement unavailable."
            }

        mean_text = mean_match.group(1)
        max_text = max_match.group(1)

        mean_db = (
            float("-inf") if mean_text == "-inf"
            else float(mean_text)
        )

        max_db = (
            float("-inf") if max_text == "-inf"
            else float(max_text)
        )

        if mean_db <= -85 and max_db <= -80:
            status = "NEAR_SILENT"
            message = "Audio is effectively silent."

        elif mean_db <= -65:
            status = "LOW_SIGNAL"
            message = "Audio signal is very weak."

        else:
            status = "NORMAL"
            message = "Audio signal detected."

        return {
            "status": status,
            "mean_volume_db": (
                None if mean_db == float("-inf")
                else round(mean_db, 2)
            ),
            "max_volume_db": (
                None if max_db == float("-inf")
                else round(max_db, 2)
            ),
            "message": message
        }

    except Exception as exc:
        print(f"Audio quality measurement failed: {exc}")

        return {
            "status": "UNAVAILABLE",
            "mean_volume_db": None,
            "max_volume_db": None,
            "message": "Could not measure audio quality."
        }


# --------------------------------------------------
# TEXT REPETITION DETECTION
# --------------------------------------------------

def detect_repetition(text):
    """Detect repeated words and consecutive three-word phrases."""

    words = re.findall(r"\b[a-z0-9']+\b", text.lower())

    repeated_words = []

    for index in range(1, len(words)):
        if words[index] == words[index - 1]:
            repeated_words.append(words[index])

    repeated_phrases = []

    for index in range(len(words) - 5):
        first = tuple(words[index:index + 3])
        second = tuple(words[index + 3:index + 6])

        if first == second:
            phrase = " ".join(first)

            if phrase not in repeated_phrases:
                repeated_phrases.append(phrase)

    return {
        "has_repetition": bool(
            repeated_words or repeated_phrases
        ),
        "repeated_words": repeated_words,
        "repeated_phrases": repeated_phrases
    }


# --------------------------------------------------
# SEGMENT-LEVEL HALLUCINATION RISK ANALYSIS
# --------------------------------------------------

def analyze_segment(segment):
    """Calculate heuristic reliability risk for one segment."""

    score = 0
    flags = []

    avg_logprob = segment["avg_logprob"]
    no_speech_prob = segment["no_speech_prob"]
    compression_ratio = segment["compression_ratio"]

    text = segment["text"]
    duration = max(segment["end"] - segment["start"], 0.01)

    # Check 1: Acoustic confidence
    if avg_logprob < -1.0:
        score += 25
        flags.append("LOW_ACOUSTIC_CONFIDENCE")

    elif avg_logprob < -0.7:
        score += 10
        flags.append("MODERATE_ACOUSTIC_CONFIDENCE")

    # Check 2: No-speech probability
    if no_speech_prob >= 0.60:
        score += 30
        flags.append("HIGH_NO_SPEECH_PROBABILITY")

    elif no_speech_prob >= 0.40:
        score += 15
        flags.append("MODERATE_NO_SPEECH_PROBABILITY")

    # Check 3: Compression ratio
    if compression_ratio > 2.4:
        score += 20
        flags.append("HIGH_COMPRESSION_RATIO")

    elif compression_ratio > 2.0:
        score += 10
        flags.append("MODERATE_COMPRESSION_RATIO")

    # Check 4: Repeated words or phrases
    repetition = detect_repetition(text)

    if repetition["has_repetition"]:
        score += 15
        flags.append("REPEATED_WORDS_OR_PHRASES")

    # Check 5: Unusually high speaking rate
    word_count = len(re.findall(r"\b[\w']+\b", text))
    words_per_second = word_count / duration

    if words_per_second > 5.5:
        score += 10
        flags.append("UNUSUALLY_HIGH_SPEAKING_RATE")

    score = min(score, 100)

    if score >= 60:
        risk_level = "HIGH"
        decision = "HUMAN_REVIEW"

    elif score >= 30:
        risk_level = "MEDIUM"
        decision = "REVIEW"

    else:
        risk_level = "LOW"
        decision = "ACCEPT"

    return {
        "start": segment["start"],
        "end": segment["end"],
        "text": text,
        "avg_logprob": avg_logprob,
        "no_speech_prob": no_speech_prob,
        "compression_ratio": compression_ratio,
        "words_per_second": round(words_per_second, 2),
        "repetition": repetition,
        "risk_score": score,
        "risk_level": risk_level,
        "decision": decision,
        "risk_flags": flags
    }


# --------------------------------------------------
# OVERALL ANALYSIS
# --------------------------------------------------

def analyze_transcription(segments, audio_quality):
    """Summarize segment-level reliability results."""

    if not segments:
        return {
            "risk_score": 0,
            "risk_level": "UNKNOWN",
            "decision": "HUMAN_REVIEW",
            "risk_flags": ["NO_TRANSCRIPTION_SEGMENTS"],
            "total_segments": 0,
            "high_risk_segments": 0,
            "medium_risk_segments": 0,
            "low_risk_segments": 0,
            "segment_analysis": []
        }

    analyzed_segments = [
        analyze_segment(segment)
        for segment in segments
    ]

    # Use the highest segment risk so that a suspicious
    # individual segment is not hidden by other clean segments.
    overall_score = max(
        item["risk_score"] for item in analyzed_segments
    )

    if overall_score >= 60:
        overall_level = "HIGH"
        overall_decision = "HUMAN_REVIEW"

    elif overall_score >= 30:
        overall_level = "MEDIUM"
        overall_decision = "REVIEW"

    else:
        overall_level = "LOW"
        overall_decision = "ACCEPT"

    overall_flags = sorted({
        flag
        for item in analyzed_segments
        for flag in item["risk_flags"]
    })

    if audio_quality["status"] == "LOW_SIGNAL":
        overall_flags.append("LOW_AUDIO_SIGNAL")

    return {
        "risk_score": overall_score,
        "risk_level": overall_level,
        "decision": overall_decision,
        "risk_flags": overall_flags,
        "total_segments": len(analyzed_segments),
        "high_risk_segments": sum(
            1 for item in analyzed_segments
            if item["risk_level"] == "HIGH"
        ),
        "medium_risk_segments": sum(
            1 for item in analyzed_segments
            if item["risk_level"] == "MEDIUM"
        ),
        "low_risk_segments": sum(
            1 for item in analyzed_segments
            if item["risk_level"] == "LOW"
        ),
        "segment_analysis": analyzed_segments
    }


# --------------------------------------------------
# HEALTH CHECK
# --------------------------------------------------

@app.get("/health")
def health():
    return {
        "status": "UP",
        "service": "ASR Guard Whisper"
    }


# --------------------------------------------------
# TRANSCRIPTION ENDPOINT
# --------------------------------------------------

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...)):
    global model

    filename = file.filename or ""
    extension = os.path.splitext(filename)[1].lower()

    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Unsupported audio format."
        )

    content = await file.read()

    if not content:
        raise HTTPException(
            status_code=400,
            detail="The uploaded audio file is empty."
        )

    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="Maximum audio size is 50 MB."
        )

    temp_path = None

    try:
        with tempfile.NamedTemporaryFile(
            suffix=extension,
            delete=False
        ) as temp:
            temp.write(content)
            temp_path = temp.name

        # Measure audio quality
        audio_quality = measure_audio_quality(temp_path)

        if audio_quality["status"] == "NEAR_SILENT":
            return {
                "filename": filename,
                "language": "unknown",
                "language_probability": 0.0,
                "transcript": "",
                "total_segments": 0,
                "segments": [],
                "fallback_used": False,
                "audio_quality": audio_quality,
                "risk_score": 0,
                "risk_level": "UNKNOWN",
                "decision": "HUMAN_REVIEW",
                "risk_flags": ["NEAR_SILENT_AUDIO"],
                "segment_analysis": []
            }

        if model is None:
            model = WhisperModel(
                "base.en",
                device="cpu",
                compute_type="int8"
            )

        # Attempt 1: VAD enabled
        segments, info = model.transcribe(
            temp_path,
            beam_size=5,
            vad_filter=True
        )

        transcript_segments = []

        for segment in segments:
            transcript_segments.append({
                "start": round(segment.start, 2),
                "end": round(segment.end, 2),
                "text": segment.text.strip(),
                "avg_logprob": round(segment.avg_logprob, 4),
                "no_speech_prob": round(
                    segment.no_speech_prob, 4
                ),
                "compression_ratio": round(
                    segment.compression_ratio, 4
                )
            })

        fallback_used = False

        # Attempt 2: Retry without VAD
        if not transcript_segments:
            print(
                f"VAD returned no segments for {filename}. "
                "Retrying without VAD..."
            )

            segments, info = model.transcribe(
                temp_path,
                beam_size=5,
                vad_filter=False
            )

            transcript_segments = []

            for segment in segments:
                transcript_segments.append({
                    "start": round(segment.start, 2),
                    "end": round(segment.end, 2),
                    "text": segment.text.strip(),
                    "avg_logprob": round(
                        segment.avg_logprob, 4
                    ),
                    "no_speech_prob": round(
                        segment.no_speech_prob, 4
                    ),
                    "compression_ratio": round(
                        segment.compression_ratio, 4
                    )
                })

            fallback_used = True

        transcript = " ".join(
            segment["text"]
            for segment in transcript_segments
        ).strip()

        # Perform heuristic analysis
        analysis = analyze_transcription(
            transcript_segments,
            audio_quality
        )

        return {
            "filename": filename,
            "language": info.language,
            "language_probability": round(
                info.language_probability, 4
            ),
            "transcript": transcript,
            "total_segments": len(transcript_segments),
            "segments": transcript_segments,
            "fallback_used": fallback_used,
            "audio_quality": audio_quality,

            # New detector outputs
            "risk_score": analysis["risk_score"],
            "risk_level": analysis["risk_level"],
            "decision": analysis["decision"],
            "risk_flags": analysis["risk_flags"],
            "high_risk_segments": analysis["high_risk_segments"],
            "medium_risk_segments": analysis["medium_risk_segments"],
            "low_risk_segments": analysis["low_risk_segments"],
            "segment_analysis": analysis["segment_analysis"],
            "detection_method": "HEURISTIC"
        }

    except HTTPException:
        raise

    except Exception as exc:
        raise HTTPException(
            status_code=500,
            detail=f"Transcription failed: {str(exc)}"
        )

    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)

        await file.close()
