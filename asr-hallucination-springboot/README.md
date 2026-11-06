# ASR Hallucination Platform — Java Spring Boot Backend

## Stack
- Java 21
- Spring Boot 3.4.5
- Maven
- Spring Web, Spring Data JPA, Validation
- MySQL

## Important ASR note
This Java backend currently accepts transcript text and an ASR confidence score, calculates text-level Word Error Rate (WER), applies a baseline confidence gate, flags repeated three-word phrases, and stores benchmark runs in MySQL. It does **not yet transcribe raw audio itself**. To add actual speech-to-text, connect a Whisper-compatible ASR inference service/API and pass its transcript and confidence to `/api/v1/analyze`.

## Setup
1. Install/verify Java 21 and Maven.
2. Start MySQL.
3. Open `src/main/resources/application.properties`. Set your MySQL password or use environment variable `DB_PASSWORD`.
4. Create database (optional; JDBC also uses createDatabaseIfNotExist):
   ```sql
   CREATE DATABASE asr_hallucination_db;
   ```
5. From the project folder run:
   ```bat
   mvn clean install
   mvn spring-boot:run
   ```
6. Test health at `http://localhost:8080/api/v1/health`.

## APIs

### Health
`GET http://localhost:8080/api/v1/health`

### Confidence-gated analysis
`POST http://localhost:8080/api/v1/analyze`
Content-Type: `application/json`
```json
{
  "referenceText": "the quick brown fox jumps over the dog",
  "hypothesisText": "the quick brown fox jumps over the dog",
  "confidence": 0.91,
  "confidenceThreshold": 0.55
}
```
A response with `gateStatus: ACCEPTED` contains `hypothesisText`; if review is required, `hypothesisText` is null. Benchmark details are persisted to `benchmark_runs`.

### Text benchmark
`POST http://localhost:8080/api/v1/benchmark/text`
```json
{
  "referenceText": "the quick brown fox jumps over the dog",
  "hypothesisText": "the quick brown fox jumped over the dog"
}
```

### View saved benchmark runs
`GET http://localhost:8080/api/v1/runs`

## Project structure
```
src/main/java/com/asrplatform/backend/
  controller/
  dto/
  entity/
  exception/
  repository/
  service/
  AsrHallucinationBackendApplication.java
src/main/resources/application.properties
pom.xml
```

## Windows CMD
```bat
cd C:\path\to\asr-hallucination-backend
java -version
mvn -version
mvn clean install
mvn spring-boot:run
```
