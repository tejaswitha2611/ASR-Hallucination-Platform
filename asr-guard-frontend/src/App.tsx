







import { useEffect, useState } from "react";







import "./App.css";















type Page = "home" | "dashboard" | "processing" | "results" | "review" | "history";















type Run = {







    id: number;







    hypothesisText?: string;







    confidence?: number;







    gateStatus?: string;







    riskLevel?: string;







};















type TranscriptSegment = {



    start: number;



    end: number;



    text: string;



    avg_logprob?: number;



    no_speech_prob?: number;



    compression_ratio?: number;



};







type SegmentAnalysisData = {
    segmentIndex: number;
    riskScore: number;
    riskLevel: string;
    riskFlags: string[];
    metricsAvailable: boolean;
};

type TranscriptionAnalysisData = {



    hallucinationRiskScore: number;



    riskLevel: string;



    gateStatus: string;



    riskFlags: string[];



    averageLogProbability: number;



    averageNoSpeechProbability: number;



    averageCompressionRatio: number;



    note: string;



};







type TranscriptionResult = {



    id?: number;



    filename: string;



    language: string;



    language_probability: number;



    transcript: string;



    total_segments: number;



    segments: TranscriptSegment[];



    segmentAnalysis?: SegmentAnalysisData[];
    analysis?: TranscriptionAnalysisData;



};











function App() {







    const [page, setPage] = useState<Page>("home");















    const goTo = (next: Page) => {







        setPage(next);







        window.scrollTo(0, 0);







    };















    return (







        <div className="app-shell">















            {page === "home" ? (







                <>







                    <header className="topbar">







                        <button className="brand" onClick={() => goTo("home")}>







                            <span className="brand-mark">A</span>







                            <span>ASR <b>Guard</b></span>







                        </button>















                        <nav className="top-nav">







                            <button onClick={() => goTo("home")}>Home</button>







                            <button onClick={() => goTo("dashboard")}>Dashboard</button>







                            <a href="#how-it-works">How it works</a>







                        </nav>















                        <button







                            className="btn btn-primary"







                            onClick={() => goTo("dashboard")}







                        >







                            Get Started →







                        </button>







                    </header>















                    <main>







                        <section className="hero">







                            <div className="hero-copy">







                                <span className="eyebrow">







                                    AI FOR TRUSTWORTHY TRANSCRIPTIONS







                                </span>















                                <h1>







                                    Reliable Speech-to-Text with{" "}







                                    <span>Hallucination Detection</span>







                                </h1>















                                <p>







                                    Detect potentially unreliable speech-to-text







                                    segments, measure transcription confidence,







                                    and route uncertain results for reprocessing







                                    or human review.







                                </p>















                                <div className="hero-actions">







                                    <button







                                        className="btn btn-primary"







                                        onClick={() => goTo("dashboard")}







                                    >







                                        Analyze Audio →







                                    </button>















                                    <a className="btn btn-secondary" href="#how-it-works">







                                        Learn More







                                    </a>







                                </div>















                                <p className="hero-footnote">







                                    ✓ Confidence-aware analysis　 ✓ Human review workflow







                                </p>







                            </div>















                            <div className="hero-art">







                                <div className="art-glow" />















                                <div className="mock-audio-card">







                                    <div className="mock-card-heading">







                                        <div>







                                            <small>ASR GUARD</small>







                                            <h3>Transcription insights</h3>







                                        </div>







                                        <span className="shield">✓</span>







                                    </div>















                                    <div className="waveform">







                                        {Array.from({ length: 46 }, (_, i) => (







                                            <span







                                                key={i}







                                                style={{







                                                    height: `${12 + ((i * 19 + 13) % 48)}px`







                                                }}







                                            />







                                        ))}







                                    </div>















                                    <div className="mock-status">







                                        <span className="check-circle">✓</span>







                                        <div>







                                            <small>CONFIDENCE GATE</small>







                                            <b>Review before accepting</b>







                                        </div>







                                        <span className="tag-green">ACTIVE</span>







                                    </div>















                                    <div className="mock-transcript">







                                        <small>TRANSCRIPT PREVIEW</small>







                                        <p>







                                            The weather is{" "}







                                            <mark>sunny today</mark> and conditions







                                            remain stable.







                                        </p>







                                    </div>















                                    <div className="mock-footer">







                                        <span>● Low risk</span>







                                        <span>● Review when needed</span>







                                    </div>







                                </div>















                                <div className="float-chip chip-one">







                                    ✓ Reliability analysis







                                </div>















                                <div className="float-chip chip-two">







                                    ✳ Confidence-gated decisions







                                </div>







                            </div>







                        </section>















                        <section className="trust-strip">







                            <span>◈ Confidence-aware</span>







                            <span>◎ Segment-level analysis</span>







                            <span>✓ Human-in-the-loop review</span>







                        </section>















                        <section className="how-section" id="how-it-works">







                            <div className="section-title">







                                <span className="eyebrow">







                                    A CLEARER WAY TO REVIEW SPEECH







                                </span>







                                <h2>How It Works</h2>







                                <p>







                                    Review speech recognition output through a







                                    guided reliability workflow.







                                </p>







                            </div>















                            <div className="steps-grid">







                                <article className="step-card">







                                    <span className="step-icon blue">↑</span>







                                    <small>01</small>







                                    <h3>Upload Audio</h3>







                                    <p>Select an audio recording for analysis.</p>







                                </article>















                                <article className="step-card">







                                    <span className="step-icon purple">⌕</span>







                                    <small>02</small>







                                    <h3>Detect Hallucinations</h3>







                                    <p>







                                        Inspect transcript reliability indicators







                                        and suspicious segments.







                                    </p>







                                </article>















                                <article className="step-card">







                                    <span className="step-icon green">✓</span>







                                    <small>03</small>







                                    <h3>Review Results</h3>







                                    <p>







                                        View confidence, risk level, and







                                        recommended actions.







                                    </p>







                                </article>







                            </div>







                        </section>







                    </main>















                    <footer className="site-footer">







                        <b>ASR Guard</b>







                        <span>Speech-to-text reliability analysis</span>







                        <span>Research prototype</span>







                    </footer>







                </>







            ) : (







                <div className="workspace">















                    <aside className="sidebar">







                        <button







                            className="sidebar-brand"







                            onClick={() => goTo("home")}







                        >







                            <span className="brand-mark">A</span>







                            ASR Guard







                        </button>















                        <small className="sidebar-label">WORKSPACE</small>















                        <button







                            className={page === "dashboard" ? "side-link active" : "side-link"}







                            onClick={() => goTo("dashboard")}







                        >







                            ▦　Dashboard







                        </button>















                        <button







                            className={page === "processing" ? "side-link active" : "side-link"}







                            onClick={() => goTo("processing")}







                        >







                            ◌　Processing







                        </button>















                        <button







                            className={page === "results" ? "side-link active" : "side-link"}







                            onClick={() => goTo("results")}







                        >







                            ▤　Analysis Results







                        </button>















                        <button







                            className={page === "review" ? "side-link active" : "side-link"}







                            onClick={() => goTo("review")}







                        >







                            ☷　Segment Review







                        </button>



                        <button

                            className={page === "history" ? "side-link active" : "side-link"}

                            onClick={() => goTo("history")}

                        >

                            ◷　Transcription History

                        </button>















                        <div className="sidebar-bottom">







                            <small className="sidebar-label">PROJECT</small>







                            <p>ASR Hallucination Benchmark</p>







                            <span>● Local backend · port 8080</span>







                        </div>







                    </aside>















                    <main className="workspace-main">







                        <div className="workspace-heading">







                            <div>







                                <span className="eyebrow">ASR GUARD WORKSPACE</span>







                                <h1>







                                    {page === "dashboard"







                                        ? "Dashboard"







                                        : page === "processing"







                                            ? "Analyzing Audio"







                                            : page === "results"







                                                ? "Analysis Results"







                                                : page === "history" ? "Transcription History" : "Segment Analysis"}







                                </h1>







                                <p>Speech transcription reliability analysis</p>







                            </div>















                            <button







                                className="btn btn-secondary"







                                onClick={() => goTo("home")}







                            >







                                ← Home







                            </button>







                        </div>















                        {page === "dashboard" && <Dashboard goTo={goTo} />}















                        {page === "processing" && <Processing goTo={goTo} />}















                        {page === "results" && <Results goTo={goTo} />}















                        {page === "review" && <Review goTo={goTo} />}



                        {page === "history" && <TranscriptionHistory goTo={goTo} />}







                    </main>







                </div>







            )}







        </div>







    );







}























// DASHBOARD COMPONENT















function Dashboard({ goTo }: { goTo: (page: Page) => void }) {















    const [file, setFile] = useState<File | null>(null);







    const [message, setMessage] = useState("");







    const [runs, setRuns] = useState<Run[]>([]);







    const [loading, setLoading] = useState(false);







    const [uploading, setUploading] = useState(false);















    async function loadRuns() {







        setLoading(true);







        setMessage("");















        try {







            const response = await fetch(







                "http://localhost:8080/api/v1/runs"







            );















            if (!response.ok) {







                throw new Error("Could not load analysis history.");







            }















            setRuns(await response.json());















        } catch {







            setMessage(







                "Could not load history. Ensure Spring Boot is running on port 8080."







            );







        } finally {







            setLoading(false);







        }







    }























    // REAL AUDIO UPLOAD AND TRANSCRIPTION















    async function analyzeAudio() {















        if (!file) {







            setMessage("Please choose an audio file first.");







            return;







        }















        if (!/\.(mp3|wav|m4a|flac|ogg|webm)$/i.test(file.name)) {







            setMessage(







                "Choose MP3, WAV, M4A, FLAC, OGG, or WebM."







            );







            return;







        }















        if (file.size > 50 * 1024 * 1024) {







            setMessage("Choose an audio file smaller than 50 MB.");







            return;







        }















        setUploading(true);







        setMessage("");















        sessionStorage.setItem("asrGuardAudioName", file.name);







        sessionStorage.setItem("asrGuardAudioSize", String(file.size));















        sessionStorage.removeItem("asrGuardTranscription");







        sessionStorage.removeItem("asrGuardError");















        goTo("processing");















        try {















            const formData = new FormData();







            formData.append("file", file);















            const response = await fetch(







                "http://localhost:8080/api/v1/transcribe",







                {







                    method: "POST",







                    body: formData







                }







            );















            const data = await response.json();















            if (!response.ok) {







                throw new Error(







                    data.detail || "Audio transcription failed."







                );







            }















            sessionStorage.setItem(







                "asrGuardTranscription",







                JSON.stringify(data)







            );















            sessionStorage.removeItem("asrGuardError");















            goTo("results");















        } catch (error) {















            const errorMessage =







                error instanceof Error







                    ? error.message







                    : "Something went wrong during transcription.";















            sessionStorage.setItem(







                "asrGuardError",







                errorMessage







            );















            goTo("results");















        } finally {







            setUploading(false);







        }







    }























    return (







        <>







            <section className="panel">















                <div className="panel-heading">







                    <div>







                        <h2>Welcome to ASR Guard</h2>







                        <p>Check your audio for transcription reliability.</p>







                    </div>







                    <span className="panel-tag">AUDIO ANALYSIS</span>







                </div>















                <div className="audio-dropzone">















                    <div className="upload-icon">♫</div>















                    <h2>Upload Audio</h2>















                    <p>Select an audio file to begin reliability analysis.</p>















                    <label className="btn btn-primary file-picker">







                        {file ? "Choose Another File" : "Choose File"}















                        <input







                            type="file"







                            accept=".mp3,.wav,.m4a,.flac,.ogg,.webm,audio/*"







                            disabled={uploading}







                            onChange={(e) => {







                                setFile(e.target.files?.[0] ?? null);







                                setMessage("");







                            }}







                        />







                    </label>















                    <p className="supported-formats">







                        Supported formats: MP3, WAV, M4A, FLAC, OGG,







                        WebM · Max 50 MB







                    </p>















                    {file && (







                        <div className="selected-file">







                            <span className="file-symbol">♫</span>















                            <div>







                                <b>{file.name}</b>







                                <small>







                                    {(file.size / 1024 / 1024).toFixed(2)} MB







                                </small>







                            </div>















                            <button







                                className="remove-file"







                                disabled={uploading}







                                onClick={() => {







                                    setFile(null);







                                    setMessage("");







                                }}







                                aria-label="Remove selected file"







                            >







                                ×







                            </button>







                        </div>







                    )}















                    <button







                        className="btn btn-primary analyze-audio-button"







                        onClick={analyzeAudio}







                        disabled={uploading}







                    >







                        {uploading ? "Uploading..." : "Analyze Audio →"}







                    </button>















                    {message && (







                        <p className="feedback-message">{message}</p>







                    )}















                </div>















                <div className="notice">







                    <b>Connected services:</b> Audio is sent to your







                    Spring Boot backend on port 8080, which forwards







                    it to the Python Whisper transcription service on







                    port 8001.







                </div>















            </section>























            <section className="panel">















                <div className="panel-heading">







                    <div>







                        <h2>Recent Analysis</h2>







                        <p>Previously saved analysis runs from your backend.</p>







                    </div>















                    <button







                        className="btn btn-secondary"







                        onClick={loadRuns}







                        disabled={loading}







                    >







                        {loading ? "Loading..." : "Refresh History"}







                    </button>







                </div>















                {runs.length === 0 ? (







                    <p className="empty-state">







                        Click “Refresh History” to load saved analysis records.







                    </p>







                ) : (







                    <div className="table-wrap">







                        <table>







                            <thead>







                                <tr>







                                    <th>Run</th>







                                    <th>Transcript</th>







                                    <th>Confidence</th>







                                    <th>Status</th>







                                    <th>Risk</th>







                                </tr>







                            </thead>















                            <tbody>







                                {runs.map((run) => (







                                    <tr key={run.id}>







                                        <td>#{run.id}</td>







                                        <td>{run.hypothesisText || "—"}</td>







                                        <td>{run.confidence ?? "—"}</td>







                                        <td>







                                            <span







                                                className={







                                                    `pill ${







                                                        run.gateStatus === "ACCEPTED"







                                                            ? "pill-green"







                                                            : "pill-yellow"







                                                    }`







                                                }







                                            >







                                                {run.gateStatus || "—"}







                                            </span>







                                        </td>







                                        <td>{run.riskLevel || "—"}</td>







                                    </tr>







                                ))}







                            </tbody>







                        </table>







                    </div>







                )}















            </section>







        </>







    );







}























// PROCESSING COMPONENT















function Processing({ goTo }: { goTo: (page: Page) => void }) {















    const name = sessionStorage.getItem("asrGuardAudioName");















    return (







        <section className="processing-card">















            <div className="processing-logo">♫</div>















            <h2>Analyzing Your Audio</h2>















            <p className="muted">







                Selected file: {name || "No file selected"}







            </p>















            <div className="spinner" />















            <p>Sending your audio for transcription.</p>















            <div className="processing-steps">







                <p className="step-done">✓　Audio file selected</p>







                <p className="step-current">●　Sending audio to Whisper</p>







                <p>○　Generating transcript</p>







                <p>○　Preparing results</p>







            </div>















            <div className="notice">







                Whisper is processing your audio. Please wait for the







                transcription to complete.







            </div>















            <button







                className="btn btn-primary"







                onClick={() => goTo("dashboard")}







            >







                ← Back to Upload







            </button>















        </section>







    );







}























// RESULTS COMPONENT















function Results({ goTo }: { goTo: (page: Page) => void }) {







    const rawResult = sessionStorage.getItem("asrGuardTranscription");



    const error = sessionStorage.getItem("asrGuardError");







    let result: TranscriptionResult | null = null;







    try {



        result = rawResult ? JSON.parse(rawResult) : null;



    } catch {



        result = null;



    }







    // Prefer analysis returned by the backend. If it is absent, calculate



    // a transparent preliminary estimate from Whisper's segment metrics.



    const analysis: TranscriptionAnalysisData | undefined = result



        ? result.analysis ?? (() => {



            const segments = result?.segments ?? [];







            if (segments.length === 0) {



                return {



                    hallucinationRiskScore: 1,



                    riskLevel: "HIGH",



                    gateStatus: "REVIEW_REQUIRED",



                    riskFlags: ["no_transcript_segments"],



                    averageLogProbability: 0,



                    averageNoSpeechProbability: 0,



                    averageCompressionRatio: 0,



                    note: "No transcript segments were returned. This is a preliminary rule-based warning, not a validated hallucination prediction."



                };



            }







            const average = (values: Array<number | undefined>) => {



                const valid = values.filter(



                    (value): value is number =>



                        typeof value === "number" && Number.isFinite(value)



                );



                return valid.length



                    ? valid.reduce((sum, value) => sum + value, 0) / valid.length



                    : 0;



            };







            const averageLogProbability = average(



                segments.map(segment => segment.avg_logprob)



            );



            const averageNoSpeechProbability = average(



                segments.map(segment => segment.no_speech_prob)



            );



            const averageCompressionRatio = average(



                segments.map(segment => segment.compression_ratio)



            );







            const flaggedSegments = segments.filter(segment =>



                (typeof segment.avg_logprob === "number" && segment.avg_logprob < -1.0) ||



                (typeof segment.no_speech_prob === "number" && segment.no_speech_prob > 0.5) ||



                (typeof segment.compression_ratio === "number" && segment.compression_ratio > 2.4)



            );







            const riskFlags: string[] = [];



            if (averageLogProbability < -1.0) {



                riskFlags.push("low_average_log_probability");



            }



            if (averageNoSpeechProbability > 0.5) {



                riskFlags.push("high_average_no_speech_probability");



            }



            if (averageCompressionRatio > 2.4) {



                riskFlags.push("high_average_compression_ratio");



            }



            if (flaggedSegments.length > 0) {



                riskFlags.push("one_or_more_segments_need_review");



            }







            const hallucinationRiskScore = Math.min(



                1,



                flaggedSegments.length / segments.length



            );



            const riskLevel =



                hallucinationRiskScore >= 0.5



                    ? "HIGH"



                    : hallucinationRiskScore > 0



                        ? "MEDIUM"



                        : "LOW";







            return {



                hallucinationRiskScore,



                riskLevel,



                gateStatus: riskLevel === "LOW" ? "ACCEPTED" : "REVIEW_REQUIRED",



                riskFlags,



                averageLogProbability,



                averageNoSpeechProbability,



                averageCompressionRatio,



                note: "Calculated using simple thresholds on Whisper decoder metrics. These indicators can identify segments for review, but they are not a trained or validated hallucination detector. Language probability is not used as transcription confidence."



            };



        })()



        : undefined;







    const riskColor =



        analysis?.riskLevel === "HIGH"



            ? "#dc2626"



            : analysis?.riskLevel === "MEDIUM"



                ? "#d97706"



                : "#059669";







    return (



        <section className="panel">



            <div className="panel-heading">



                <div>



                    <h2>Analysis Results</h2>



                    <p>Your audio transcription and reliability analysis.</p>



                </div>



                <span className="panel-tag">ASR ANALYSIS</span>



            </div>







            {error && (



                <div className="notice">



                    <b>Transcription failed:</b>



                    <p>{error}</p>



                </div>



            )}







            {result && (



                <>



                    <div className="notice">



                        <b>Audio file:</b> {result.filename}



                        <br />



                        <b>Detected language:</b> {result.language}



                        <br />



                        <b>Language probability:</b> {result.language_probability}



                        <br />



                        <b>Total segments:</b> {result.total_segments ?? result.segments?.length ?? 0}



                    </div>







                    {analysis ? (



                        <>



                            <div className="panel">



                                <h2>Hallucination Risk Analysis</h2>



                                <div style={{



                                    display: "grid",



                                    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",



                                    gap: "16px",



                                    marginTop: "20px"



                                }}>



                                    <div style={{ padding: "20px", border: "1px solid #dbe3ef", borderRadius: "12px" }}>



                                        <small>HALLUCINATION RISK SCORE</small>



                                        <h1 style={{ color: riskColor, fontSize: "32px", margin: "10px 0" }}>



                                            {(analysis.hallucinationRiskScore * 100).toFixed(1)}%



                                        </h1>



                                        <small>Preliminary heuristic estimate</small>



                                    </div>



                                    <div style={{ padding: "20px", border: "1px solid #dbe3ef", borderRadius: "12px" }}>



                                        <small>RISK LEVEL</small>



                                        <h2 style={{ color: riskColor, marginTop: "14px" }}>



                                            {analysis.riskLevel}



                                        </h2>



                                    </div>



                                    <div style={{ padding: "20px", border: "1px solid #dbe3ef", borderRadius: "12px" }}>



                                        <small>CONFIDENCE GATE DECISION</small>



                                        <h2 style={{



                                            color: analysis.gateStatus === "ACCEPTED" ? "#059669" : "#d97706",



                                            marginTop: "14px",



                                            overflowWrap: "anywhere"



                                        }}>



                                            {analysis.gateStatus}



                                        </h2>



                                    </div>



                                </div>



                            </div>







                            <div className="panel">



                                <h2>Whisper Reliability Metrics</h2>



                                <div className="table-wrap">



                                    <table>



                                        <thead>



                                            <tr>



                                                <th>Metric</th>



                                                <th>Value</th>



                                                <th>Meaning</th>



                                            </tr>



                                        </thead>



                                        <tbody>



                                            <tr>



                                                <td>Average Log Probability</td>



                                                <td>{analysis.averageLogProbability?.toFixed(4) ?? "—"}</td>



                                                <td>Decoder likelihood indicator</td>



                                            </tr>



                                            <tr>



                                                <td>Average No-Speech Probability</td>



                                                <td>{analysis.averageNoSpeechProbability?.toFixed(4) ?? "—"}</td>



                                                <td>Model estimate that a segment contains no speech</td>



                                            </tr>



                                            <tr>



                                                <td>Average Compression Ratio</td>



                                                <td>{analysis.averageCompressionRatio?.toFixed(4) ?? "—"}</td>



                                                <td>Text repetition / compression indicator</td>



                                            </tr>



                                        </tbody>



                                    </table>



                                </div>



                            </div>







                            <div className="panel">



                                <h2>Risk Flags</h2>



                                {analysis.riskFlags?.length ? (



                                    <ul>



                                        {analysis.riskFlags.map((flag, index) => (



                                            <li key={index}>{flag.replaceAll("_", " ")}</li>



                                        ))}



                                    </ul>



                                ) : (



                                    <p style={{ color: "#059669" }}>



                                        ✓ No heuristic warning flags detected.



                                    </p>



                                )}



                                <p className="muted">{analysis.note}</p>



                            </div>



                        </>



                    ) : (



                        <div className="notice">



                            No reliability metrics were returned by Whisper, so a risk estimate cannot be calculated.



                            Check that the Python service returns avg_logprob, no_speech_prob, and compression_ratio for each segment.



                        </div>



                    )}







                    <div className="panel">



                        <h2>Generated Transcript</h2>



                        <p>{result.transcript || "No speech detected."}</p>



                    </div>







                    <div className="panel">



                        <h2>Transcript Segments</h2>



                        {result.segments?.length > 0 ? (



                            <div className="table-wrap">



                                <table>



                                    <thead>



                                        <tr>



                                            <th>Start</th>



                                            <th>End</th>



                                            <th>Transcript</th>



                                            <th>Log Probability</th>



                                            <th>No-Speech Probability</th>



                                            <th>Compression Ratio</th>
                                            <th>Risk Score</th>
                                            <th>Risk Level</th>
                                            <th>Risk Flags</th>



                                        </tr>



                                    </thead>



                                    <tbody>



                                        {result.segments.map((segment, index) => (



                                            <tr key={index}>



                                                <td>{segment.start}s</td>



                                                <td>{segment.end}s</td>



                                                <td>{segment.text}</td>



                                                <td>{segment.avg_logprob?.toFixed(4) ?? "—"}</td>



                                                <td>{segment.no_speech_prob?.toFixed(4) ?? "—"}</td>



                                                <td>{segment.compression_ratio?.toFixed(4) ?? "—"}</td>
                                                <td>{result.segmentAnalysis?.[index]?.metricsAvailable
                                                    ? `${(result.segmentAnalysis[index].riskScore * 100).toFixed(1)}%`
                                                    : "Unavailable"}</td>
                                                <td>{result.segmentAnalysis?.[index]?.riskLevel ?? "—"}</td>
                                                <td>{result.segmentAnalysis?.[index]?.riskFlags?.length
                                                    ? result.segmentAnalysis[index].riskFlags.join(", ").replaceAll("_", " ")
                                                    : result.segmentAnalysis?.[index]?.metricsAvailable
                                                        ? "No flags"
                                                        : "Metrics unavailable"}</td>



                                            </tr>



                                        ))}



                                    </tbody>



                                </table>



                            </div>



                        ) : (



                            <p>No transcript segments detected.</p>



                        )}



                    </div>



                </>



            )}







            {!result && !error && (



                <p>No transcription result available yet.</p>



            )}







            <button className="btn btn-primary" onClick={() => goTo("dashboard")}>



                ← Back to Dashboard



            </button>



        </section>



    );



}











// REVIEW COMPONENT



















function Review({ goTo }: { goTo: (page: Page) => void }) {







    const rawResult = sessionStorage.getItem("asrGuardTranscription");

    const name = sessionStorage.getItem("asrGuardAudioName");

    const selectedRunId = sessionStorage.getItem("asrGuardSelectedRunId");

    const selectedRunRaw = sessionStorage.getItem("asrGuardSelectedRun");

    let selectedRun: Record<string, unknown> | null = null;

    try {
        selectedRun = selectedRunRaw ? JSON.parse(selectedRunRaw) : null;
    } catch {
        selectedRun = null;
    }







    type Segment = {



        start: number;



        end: number;



        text: string;



        avg_logprob?: number;



        no_speech_prob?: number;



        compression_ratio?: number;



    };







    type SegmentAnalysis = {
        segmentIndex: number;
        riskScore: number;
        riskLevel: string;
        riskFlags: string[];
        metricsAvailable: boolean;
    };

    type TranscriptionResult = {
        id?: number;
        filename?: string;
        transcript?: string;
        language?: string;
        language_probability?: number;
        total_segments?: number;
        segments?: Segment[];
        segmentAnalysis?: SegmentAnalysis[];
    };

    const [result, setResult] = useState<TranscriptionResult | null>(() => {
        try {
            return rawResult ? JSON.parse(rawResult) : null;
        } catch {
            return null;
        }
    });

    const [loadingSegments, setLoadingSegments] = useState(false);
    const [segmentLoadError, setSegmentLoadError] = useState("");

    useEffect(() => {
        if (!selectedRunId) return;

        let cancelled = false;

        async function loadSavedSegments() {
            setLoadingSegments(true);
            setSegmentLoadError("");

            try {
                const response = await fetch(
                    `http://localhost:8080/api/v1/transcription-runs/${encodeURIComponent(selectedRunId!)}/segments`
                );

                const payload = await response.json().catch(() => ({}));

                if (!response.ok) {
                    throw new Error(
                        typeof payload?.detail === "string"
                            ? payload.detail
                            : "Could not load saved segments."
                    );
                }

                const savedSegments = typeof payload === "string"
                    ? JSON.parse(payload)
                    : payload;

                const selected = selectedRun ?? {};
                const nextResult: TranscriptionResult = {
                    id: Number(selectedRunId),
                    filename: String(selected.filename ?? sessionStorage.getItem("asrGuardSelectedRunFilename") ?? name ?? ""),
                    transcript: String(selected.transcript ?? ""),
                    language: String(selected.language ?? ""),
                    language_probability: Number(selected.languageProbability ?? 0),
                    total_segments: Array.isArray(savedSegments?.segments)
                        ? savedSegments.segments.length
                        : 0,
                    segments: Array.isArray(savedSegments?.segments)
                        ? savedSegments.segments
                        : [],
                    segmentAnalysis: Array.isArray(savedSegments?.segmentAnalysis)
                        ? savedSegments.segmentAnalysis
                        : []
                };

                if (!cancelled) setResult(nextResult);
            } catch (error) {
                if (!cancelled) {
                    setSegmentLoadError(
                        error instanceof Error
                            ? error.message
                            : "Could not load saved segments."
                    );
                }
            } finally {
                if (!cancelled) setLoadingSegments(false);
            }
        }

        void loadSavedSegments();
        return () => { cancelled = true; };
    }, [selectedRunId]);

    const segments = result?.segments ?? [];
    const filename = result?.filename || name || "";



    const [decisions, setDecisions] = useState<Record<number, string>>({});

    const [decisionStatus, setDecisionStatus] = useState<Record<number, string>>({});

    const [loadingDecisions, setLoadingDecisions] = useState(false);



    // Load decisions already saved in MySQL for this audio file.

    useEffect(() => {

        if (!filename) return;



        let cancelled = false;



        async function loadSavedDecisions() {

            setLoadingDecisions(true);

            try {

                const response = await fetch(

                    `http://localhost:8080/api/v1/review-decisions/${encodeURIComponent(filename)}`

                );



                if (!response.ok) {

                    throw new Error("Could not load saved review decisions.");

                }



                const saved = await response.json();

                if (cancelled) return;



                const loaded: Record<number, string> = {};

                if (Array.isArray(saved)) {

                    saved.forEach((item: { segmentIndex?: number; decision?: string }) => {

                        if (typeof item.segmentIndex === "number" && typeof item.decision === "string") {

                            loaded[item.segmentIndex] = item.decision;

                        }

                    });

                }



                setDecisions(loaded);

                sessionStorage.setItem("asrGuardSegmentDecisions", JSON.stringify(loaded));

            } catch (error) {

                if (!cancelled) {

                    setDecisionStatus({

                        [-1]: error instanceof Error

                            ? error.message

                            : "Could not load saved decisions."

                    });

                }

            } finally {

                if (!cancelled) setLoadingDecisions(false);

            }

        }



        void loadSavedDecisions();

        return () => { cancelled = true; };

    }, [filename]);



    async function updateDecision(index: number, value: string) {

        const updated = { ...decisions, [index]: value };

        setDecisions(updated);

        sessionStorage.setItem("asrGuardSegmentDecisions", JSON.stringify(updated));

        setDecisionStatus(previous => ({ ...previous, [index]: "Saving decision..." }));



        try {

            const response = await fetch("http://localhost:8080/api/v1/review-decisions", {

                method: "POST",

                headers: { "Content-Type": "application/json" },

                body: JSON.stringify({

                    filename,

                    segmentIndex: index,

                    segmentText: segments[index]?.text || "",

                    decision: value

                })

            });



            const data = await response.json().catch(() => ({}));

            if (!response.ok) {

                throw new Error(data.detail || "Could not save review decision to MySQL.");

            }



            setDecisionStatus(previous => ({ ...previous, [index]: "Saved to MySQL." }));

        } catch (error) {

            setDecisionStatus(previous => ({

                ...previous,

                [index]: error instanceof Error

                    ? `${error.message} Your selection is only stored in this browser for now.`

                    : "Could not save decision. Check Spring Boot on port 8080."

            }));

        }

    }







    function assessSegment(index: number) {
        const backendAssessment = result?.segmentAnalysis?.find(
            item => item.segmentIndex === index
        );

        // Java backend is the source of truth for segment risk.
        if (backendAssessment) {
            return {
                flags: backendAssessment.riskFlags ?? [],
                riskScore: backendAssessment.riskScore,
                riskLevel: backendAssessment.riskLevel,
                metricsAvailable: backendAssessment.metricsAvailable
            };
        }

        // Older responses may not contain segmentAnalysis.
        return {
            flags: [] as string[],
            riskScore: 0,
            riskLevel: "UNAVAILABLE",
            metricsAvailable: false
        };
    }



    const riskStyle = (level: string) => ({



        color:



            level === "HIGH"



                ? "#dc2626"



                : level === "MEDIUM"



                    ? "#d97706"



                    : "#059669",



        fontWeight: 700 as const



    });







    return (



        <section className="panel">







            <div className="panel-heading">



                <div>



                    <h2>Segment Analysis</h2>



                    <p>



                        Inspect individual transcript segments and their



                        reliability indicators.



                    </p>



                </div>







                <span className="panel-tag">SEGMENT REVIEW</span>



            </div>







            <div className="notice">



                <b>Selected audio:</b>{" "}



                {filename || "No file selected"}



                <br />



                <b>Total segments:</b> {segments.length}



                <br />



                Risk levels are preliminary heuristic estimates,



                not validated hallucination predictions.



            </div>







            {loadingSegments ? (
                <div className="notice">Loading saved transcript segments...</div>
            ) : segmentLoadError ? (
                <div className="notice">
                    <b>Could not open this recording:</b> {segmentLoadError}
                    <p>If this is an older recording, it may need to be reprocessed to save its segment data.</p>
                </div>
            ) : !result ? (



                <div className="notice">



                    No transcription data found. Please upload an audio



                    file from the Dashboard first.



                </div>



            ) : segments.length === 0 ? (



                <div className="notice">



                    No transcript segments were detected in this audio.



                </div>



            ) : (



                <>



                    {segments.map((segment, index) => {







                        const assessment = assessSegment(index);







                        return (



                            <div



                                key={index}



                                className="panel"



                                style={{



                                    marginTop: "20px",



                                    border: "1px solid #dbe3ef"



                                }}



                            >







                                <div className="panel-heading">



                                    <div>



                                        <h3>Segment {index + 1}</h3>



                                        <p>



                                            {Number(segment.start).toFixed(2)}s –



                                            {" "}



                                            {Number(segment.end).toFixed(2)}s



                                        </p>



                                    </div>







                                    <span style={riskStyle(assessment.riskLevel)}>



                                        {assessment.riskLevel} RISK



                                    </span>



                                </div>







                                <h3>Transcript</h3>







                                <p>



                                    {segment.text || "No transcript text"}



                                </p>







                                <h3>Reliability Metrics</h3>







                                <div className="table-wrap">



                                    <table>



                                        <thead>



                                            <tr>



                                                <th>Metric</th>



                                                <th>Value</th>



                                            </tr>



                                        </thead>







                                        <tbody>



                                            <tr>



                                                <td>Average Log Probability</td>



                                                <td>



                                                    {segment.avg_logprob?.toFixed(4) ?? "—"}



                                                </td>



                                            </tr>







                                            <tr>



                                                <td>No-Speech Probability</td>



                                                <td>



                                                    {segment.no_speech_prob?.toFixed(4) ?? "—"}



                                                </td>



                                            </tr>







                                            <tr>



                                                <td>Compression Ratio</td>



                                                <td>



                                                    {segment.compression_ratio?.toFixed(4) ?? "—"}



                                                </td>



                                            </tr>



                                        </tbody>



                                    </table>



                                </div>







                                <h3 style={{ marginTop: "20px" }}>



                                    Why was this flagged?



                                </h3>







                                {assessment.flags.length > 0 ? (



                                    <ul>



                                        {assessment.flags.map((flag) => (



                                            <li key={flag}>{flag}</li>



                                        ))}



                                    </ul>



                                ) : (



                                    <p style={{ color: "#059669" }}>



                                        ✓ No heuristic warning indicators



                                        detected for this segment.



                                    </p>



                                )}







                                <p className="muted">



                                    Preliminary risk score:{" "}



                                    {(assessment.riskScore * 100).toFixed(0)}%



                                </p>







                                <label



                                    className="field-label"



                                    htmlFor={`decision-${index}`}



                                >



                                    Human Review Decision



                                </label>







                                <select



                                    id={`decision-${index}`}



                                    value={decisions[index] || "Not reviewed"}



                                    onChange={(e) =>



                                        updateDecision(index, e.target.value)



                                    }



                                >



                                    <option>Not reviewed</option>



                                    <option>Mark as correct</option>



                                    <option>Send for human review</option>



                                    <option>Request re-analysis</option>



                                </select>







                                <p className="muted">



                                    {decisionStatus[index] ||

                                        (loadingDecisions

                                            ? "Loading saved decision..."

                                            : decisions[index] && decisions[index] !== "Not reviewed"

                                                ? "Decision loaded from MySQL."

                                                : "Waiting for human review.")}



                                </p>







                            </div>



                        );



                    })}



                </>



            )}







            <button



                className="btn btn-secondary"



                onClick={() => {
                    if (sessionStorage.getItem("asrGuardSelectedRunId")) {
                        goTo("history");
                    } else {
                        goTo("results");
                    }
                }}



            >



                {sessionStorage.getItem("asrGuardSelectedRunId") ? "← Back to History" : "← Back to Results"}



            </button>







        </section>



    );



}









// TRANSCRIPTION HISTORY COMPONENT

type ReviewDecisionRecord = {
    id?: number;
    filename?: string;
    segmentIndex: number;
    segmentText?: string;
    decision: string;
    createdAt?: string;
};

type SavedTranscriptionRun = {
    id: number;
    filename: string;
    transcript: string;
    language: string;
    languageProbability: number;
    avgLogprob: number;
    noSpeechProbability: number;
    compressionRatio: number;
    hallucinationRiskScore: number;
    riskLevel: string;
    gateStatus: string;
    riskFlags: string;
    createdAt: string;
    reviewDecisions?: ReviewDecisionRecord[];
};

function TranscriptionHistory({ goTo }: { goTo: (page: Page) => void }) {
    const [runs, setRuns] = useState<SavedTranscriptionRun[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    async function loadHistory() {
        setLoading(true);
        setError("");

        try {
            const response = await fetch("http://localhost:8080/api/v1/transcription-runs");
            if (!response.ok) {
                throw new Error("Could not load transcription history.");
            }

            const data = await response.json();
            const savedRuns: SavedTranscriptionRun[] = Array.isArray(data) ? data : [];

            // Load the human review decisions associated with each saved audio file.
            const runsWithReviews = await Promise.all(
                savedRuns.map(async (run) => {
                    try {
                        const reviewResponse = await fetch(
                            `http://localhost:8080/api/v1/review-decisions/${encodeURIComponent(run.filename)}`
                        );

                        if (!reviewResponse.ok) {
                            return { ...run, reviewDecisions: [] };
                        }

                        const reviewData = await reviewResponse.json();
                        return {
                            ...run,
                            reviewDecisions: Array.isArray(reviewData) ? reviewData : []
                        };
                    } catch {
                        // Keep the transcription history visible even if review data cannot load.
                        return { ...run, reviewDecisions: [] };
                    }
                })
            );

            setRuns(runsWithReviews);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "Could not load history. Check Spring Boot on port 8080."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        void loadHistory();
    }, []);

    return (
        <section className="panel">
            <div className="panel-heading">
                <div>
                    <h2>Saved Transcription History</h2>
                    <p>Audio transcription, reliability analysis, and human review decisions saved in MySQL.</p>
                </div>
                <button className="btn btn-secondary" onClick={loadHistory} disabled={loading}>
                    {loading ? "Loading..." : "Refresh History"}
                </button>
            </div>

            {error && <div className="notice">{error}</div>}

            {!error && runs.length === 0 && !loading && (
                <p className="empty-state">Click Refresh History to load saved audio analysis records.</p>
            )}

            {runs.length > 0 && (
                <div className="table-wrap">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Audio File</th>
                                <th>Transcript</th>
                                <th>Risk Score</th>
                                <th>Risk Level</th>
                                <th>Gate Decision</th>
                                <th>Human Review</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {runs.map((run) => {
                                const reviews = run.reviewDecisions ?? [];

                                return (
                                    <tr key={run.id}>
                                        <td>#{run.id}</td>
                                        <td>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    sessionStorage.setItem("asrGuardSelectedRunId", String(run.id));
                                                    sessionStorage.setItem("asrGuardSelectedRunFilename", run.filename);
                                                    sessionStorage.setItem("asrGuardSelectedRun", JSON.stringify(run));
                                                    goTo("review");
                                                }}
                                                style={{
                                                    background: "transparent",
                                                    border: "none",
                                                    padding: 0,
                                                    color: "#2563eb",
                                                    textDecoration: "underline",
                                                    cursor: "pointer",
                                                    font: "inherit",
                                                    textAlign: "left"
                                                }}
                                            >
                                                {run.filename}
                                            </button>
                                        </td>
                                        <td>{run.transcript || "No speech detected"}</td>
                                        <td>{(Number(run.hallucinationRiskScore) * 100).toFixed(1)}%</td>
                                        <td>{run.riskLevel}</td>
                                        <td>{run.gateStatus}</td>
                                        <td>
                                            {reviews.length === 0 ? (
                                                <span className="muted">Not reviewed</span>
                                            ) : (
                                                <div>
                                                    <strong>{reviews.length} segment(s) reviewed</strong>
                                                    {reviews.map((review) => (
                                                        <div key={review.id ?? review.segmentIndex}>
                                                            Segment {review.segmentIndex + 1}: {review.decision}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </td>
                                        <td>{run.createdAt ? new Date(run.createdAt).toLocaleString() : "—"}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <button className="btn btn-secondary" onClick={() => goTo("dashboard")}>
                ← Back to Dashboard
            </button>
        </section>
    );
}

export default App;