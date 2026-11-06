
from pathlib import Path
import requests


# ==========================================
# CONFIGURATION
# ==========================================

AUDIO_FOLDER = Path(
    r"C:\Users\Victus\Downloads\1789489472613-sps-corpus-5.0-2026-09-11-en\sps-corpus-5.0-2026-09-11-en\audios"
)

API_URL = "http://localhost:8080/api/v1/transcribe"
HISTORY_URL = "http://localhost:8080/api/v1/transcription-runs"

BATCH_SIZE = 64


# ==========================================
# GET PROCESSED FILENAMES
# ========================================== 

def get_processed_filenames():
 
    response = requests.get(HISTORY_URL, timeout=30)
    response.raise_for_status()

    records = response.json()

    if not isinstance(records, list):
        raise ValueError("Unexpected transcription history format.")

    return {
        record["filename"]
        for record in records
        if isinstance(record, dict) and record.get("filename")
    }


# ==========================================
# PROCESS NEW AUDIO FILES
# ==========================================

print("\nChecking previously processed audio files...")

try:
    processed_files = get_processed_filenames()

except Exception as error:
    raise SystemExit(
        f"Could not check transcription history: {error}"
    )

print("Already processed:", len(processed_files))


# ==========================================
# SELECT NEW FILES
# ==========================================

all_files = sorted(AUDIO_FOLDER.glob("*.mp3"))

unprocessed_files = [
    file for file in all_files
    if file.name not in processed_files
]

new_files = unprocessed_files[:BATCH_SIZE]

print("Total audio files:", len(all_files))
print("New files selected:", len(new_files))
print("Skipped existing files:", len(all_files) - len(unprocessed_files))

if not new_files:
    print("\nNo new audio files available.")
    raise SystemExit


# ==========================================
# BATCH PROCESSING
# ==========================================

successful = 0
failed = 0
skipped = 0

for index, audio_path in enumerate(new_files, start=1):

    print(
        f"\n[{index}/{len(new_files)}] Processing: {audio_path.name}"
    )

    try:

        with audio_path.open("rb") as audio:

            response = requests.post(
                API_URL,
                files={
                    "file": (
                        audio_path.name,
                        audio,
                        "audio/mpeg"
                    )
                },
                timeout=600
            )

        # Handle duplicate files
        if response.status_code == 409:

            skipped += 1
            print("SKIPPED: Already processed.")
            continue

        # Handle failed requests
        if not response.ok:

            failed += 1

            print("FAILED:", response.status_code)
            print(response.text)

            continue

        # Read successful API response
        result = response.json()

        # IMPORTANT:
        # Overall audio risk is inside result["analysis"]
        analysis = result.get("analysis", {})

        risk_level = analysis.get("riskLevel", "Not found")
        gate_status = analysis.get("gateStatus", "Not found")
        risk_score = analysis.get(
            "hallucinationRiskScore",
            "Not found"
        )

        risk_flags = analysis.get("riskFlags", [])

        successful += 1

        print("SUCCESS")
        print("Risk level:", risk_level)
        print("Gate status:", gate_status)
        print("Risk score:", risk_score)
        print("Risk flags:", risk_flags)

    except requests.RequestException as error:

        failed += 1

        print("ERROR:", error)

    except (ValueError, AttributeError) as error:

        failed += 1

        print("RESPONSE ERROR:", error)


# ==========================================
# FINAL SUMMARY
# ==========================================

print("\n========== BATCH TEST SUMMARY ==========")

print("Selected files:", len(new_files))
print("Successful:", successful)
print("Skipped duplicates:", skipped)
print("Failed:", failed)

print("\nBatch completed!")


# ==========================================
# DATASET PROGRESS
# ==========================================

try:

    updated_files = get_processed_filenames()

    print("\n========== DATASET PROGRESS ==========")
    print("Total dataset files:", len(all_files))
    print("Unique processed files:", len(updated_files))
    print("Remaining files:", max(0, len(all_files) - len(updated_files)))

except Exception as error:

    print("Could not refresh dataset progress:", error)
