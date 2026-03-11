import { useState, useRef } from "react";

// ── Point this at your deployed backend URL ──────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:3001";

const GOOGLE_FONTS = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&display=swap');`;

const styles = `
  ${GOOGLE_FONTS}
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --bg: #0a0a0f; --surface: #111118; --surface2: #1a1a24;
    --border: #2a2a3a; --accent: #c8f135; --accent2: #f13564;
    --text: #e8e8f0; --muted: #666680; --warn: #f1a035;
  }
  body { background: var(--bg); color: var(--text); font-family: 'DM Mono', monospace; }
  .app {
    min-height: 100vh; background: var(--bg);
    background-image: radial-gradient(ellipse at 20% 0%, rgba(200,241,53,0.06) 0%, transparent 50%),
                      radial-gradient(ellipse at 80% 100%, rgba(241,53,100,0.06) 0%, transparent 50%);
    padding: 40px 24px 80px; max-width: 900px; margin: 0 auto;
  }
  .header { margin-bottom: 48px; }
  .badge {
    display: inline-flex; align-items: center; gap: 6px;
    background: rgba(200,241,53,0.1); border: 1px solid rgba(200,241,53,0.3);
    color: var(--accent); font-size: 11px; font-weight: 500;
    letter-spacing: 0.12em; text-transform: uppercase;
    padding: 5px 12px; border-radius: 2px; margin-bottom: 20px;
  }
  .badge::before {
    content: ''; width: 6px; height: 6px; background: var(--accent);
    border-radius: 50%; animation: pulse 2s infinite;
  }
  @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
  h1 {
    font-family: 'Syne', sans-serif; font-size: clamp(32px, 5vw, 52px);
    font-weight: 800; line-height: 1.05; letter-spacing: -0.03em; color: var(--text);
  }
  h1 span { color: var(--accent); }
  .subtitle { margin-top: 12px; color: var(--muted); font-size: 13px; line-height: 1.6; }
  .source-tabs {
    display: flex; gap: 2px; background: var(--surface);
    border: 1px solid var(--border); border-radius: 4px;
    padding: 3px; margin-bottom: 20px; overflow-x: auto;
  }
  .tab-btn {
    flex: 1; min-width: 120px; padding: 10px 14px;
    background: transparent; border: none; color: var(--muted);
    font-family: 'DM Mono', monospace; font-size: 11px; font-weight: 500;
    letter-spacing: 0.06em; text-transform: uppercase; cursor: pointer;
    border-radius: 2px; transition: all 0.15s; white-space: nowrap;
  }
  .tab-btn:hover { color: var(--text); }
  .tab-btn.active { background: var(--accent); color: #0a0a0f; }
  .input-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 6px; padding: 24px; margin-bottom: 16px;
  }
  .input-label {
    font-size: 11px; font-weight: 500; letter-spacing: 0.1em;
    text-transform: uppercase; color: var(--muted); margin-bottom: 10px; display: block;
  }
  .text-input {
    width: 100%; background: var(--surface2); border: 1px solid var(--border);
    border-radius: 4px; color: var(--text); font-family: 'DM Mono', monospace;
    font-size: 13px; padding: 12px 16px; outline: none; transition: border-color 0.2s;
  }
  .text-input:focus { border-color: var(--accent); }
  .text-input::placeholder { color: var(--muted); }
  textarea.text-input { resize: vertical; min-height: 160px; line-height: 1.7; }
  .upload-zone {
    border: 2px dashed var(--border); border-radius: 4px; padding: 40px 24px;
    text-align: center; cursor: pointer; transition: all 0.2s; background: var(--surface2);
  }
  .upload-zone:hover, .upload-zone.dragover { border-color: var(--accent); background: rgba(200,241,53,0.04); }
  .upload-icon { font-size: 32px; margin-bottom: 12px; }
  .upload-text { color: var(--muted); font-size: 12px; line-height: 1.8; }
  .upload-text strong { color: var(--accent); cursor: pointer; }
  .file-name {
    margin-top: 12px; display: inline-flex; align-items: center; gap: 8px;
    background: rgba(200,241,53,0.1); border: 1px solid rgba(200,241,53,0.3);
    color: var(--accent); font-size: 12px; padding: 6px 12px; border-radius: 2px;
  }
  .hint { font-size: 11px; color: var(--muted); margin-top: 8px; line-height: 1.5; }
  .analyze-btn {
    width: 100%; padding: 16px; background: var(--accent); border: none;
    border-radius: 4px; color: #0a0a0f; font-family: 'Syne', sans-serif;
    font-size: 15px; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase;
    cursor: pointer; transition: all 0.2s; display: flex; align-items: center;
    justify-content: center; gap: 10px; margin-top: 16px;
  }
  .analyze-btn:hover:not(:disabled) {
    background: #d9ff45; transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(200,241,53,0.25);
  }
  .analyze-btn:disabled { opacity: 0.4; cursor: not-allowed; }
  .loading-state {
    text-align: center; padding: 60px 24px; background: var(--surface);
    border: 1px solid var(--border); border-radius: 6px; margin-top: 24px;
  }
  .spinner {
    width: 40px; height: 40px; border: 2px solid var(--border);
    border-top-color: var(--accent); border-radius: 50%;
    animation: spin 0.8s linear infinite; margin: 0 auto 20px;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  .loading-text { color: var(--muted); font-size: 13px; line-height: 1.8; }
  .loading-text strong { color: var(--text); display: block; margin-bottom: 4px; font-family: 'Syne', sans-serif; font-size: 16px; }
  .results { margin-top: 32px; }
  .results-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; flex-wrap: wrap; gap: 12px; }
  .results-title { font-family: 'Syne', sans-serif; font-size: 20px; font-weight: 700; }
  .stats-row { display: flex; gap: 10px; flex-wrap: wrap; }
  .stat-chip {
    display: flex; align-items: center; gap: 6px; padding: 5px 12px;
    border-radius: 2px; font-size: 11px; font-weight: 500;
    letter-spacing: 0.06em; text-transform: uppercase;
  }
  .stat-chip.errors { background: rgba(241,53,100,0.12); border: 1px solid rgba(241,53,100,0.3); color: var(--accent2); }
  .stat-chip.warnings { background: rgba(241,160,53,0.12); border: 1px solid rgba(241,160,53,0.3); color: var(--warn); }
  .stat-chip.clean { background: rgba(200,241,53,0.12); border: 1px solid rgba(200,241,53,0.3); color: var(--accent); }
  .error-list { display: flex; flex-direction: column; gap: 10px; }
  .error-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 4px; padding: 16px 20px; border-left: 3px solid transparent; transition: all 0.15s;
  }
  .error-card.spelling { border-left-color: var(--accent2); }
  .error-card.grammar { border-left-color: var(--warn); }
  .error-card:hover { background: var(--surface2); }
  .error-top { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; flex-wrap: wrap; }
  .line-badge {
    font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--muted);
    background: var(--surface2); border: 1px solid var(--border); padding: 3px 8px; border-radius: 2px;
  }
  .error-type { font-size: 10px; font-weight: 500; letter-spacing: 0.1em; text-transform: uppercase; padding: 3px 8px; border-radius: 2px; }
  .error-type.spelling { background: rgba(241,53,100,0.12); color: var(--accent2); }
  .error-type.grammar { background: rgba(241,160,53,0.12); color: var(--warn); }
  .error-original { font-size: 13px; color: var(--muted); margin-bottom: 8px; line-height: 1.6; }
  .error-original mark { background: rgba(241,53,100,0.2); color: var(--accent2); padding: 1px 3px; border-radius: 2px; }
  .error-suggestion { font-size: 12px; color: var(--text); line-height: 1.6; }
  .suggestion-label { color: var(--accent); font-size: 10px; text-transform: uppercase; letter-spacing: 0.1em; margin-right: 6px; }
  .all-clear {
    text-align: center; padding: 60px 24px; background: var(--surface);
    border: 1px solid rgba(200,241,53,0.3); border-radius: 6px;
  }
  .all-clear-icon { font-size: 48px; margin-bottom: 16px; }
  .all-clear h3 { font-family: 'Syne', sans-serif; font-size: 22px; font-weight: 700; color: var(--accent); margin-bottom: 8px; }
  .all-clear p { color: var(--muted); font-size: 13px; }
  .reset-btn {
    margin-top: 32px; padding: 10px 24px; background: transparent;
    border: 1px solid var(--border); border-radius: 4px; color: var(--muted);
    font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 0.06em;
    text-transform: uppercase; cursor: pointer; transition: all 0.2s;
  }
  .reset-btn:hover { border-color: var(--text); color: var(--text); }
  .error-box {
    background: rgba(241,53,100,0.08); border: 1px solid rgba(241,53,100,0.25);
    border-radius: 4px; padding: 14px 18px; color: var(--accent2);
    font-size: 13px; line-height: 1.6; margin-bottom: 16px;
  }
  .error-box strong { display: block; margin-bottom: 4px; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; }
  .summary-note {
    font-size: 12px; color: var(--muted); background: var(--surface2);
    border: 1px solid var(--border); border-radius: 4px;
    padding: 12px 16px; margin-bottom: 20px; line-height: 1.6;
  }
  .section-label { font-size: 10px; letter-spacing: 0.15em; text-transform: uppercase; color: var(--muted); margin-bottom: 16px; }
  .truncated-note {
    font-size: 11px; color: var(--warn); background: rgba(241,160,53,0.08);
    border: 1px solid rgba(241,160,53,0.2); border-radius: 4px;
    padding: 8px 14px; margin-bottom: 16px;
  }
`;

const SAMPLE_SRT = `1
00:00:01,000 --> 00:00:04,000
Welcom to our channal! Todays video is about productivity.

2
00:00:04,500 --> 00:00:08,000
We going to show you how to manage you're time more effectively.

3
00:00:08,500 --> 00:00:12,000
Their are three key principals that successfull people follow.

4
00:00:12,500 --> 00:00:16,000
First, they priortize there tasks every morning.

5
00:00:16,500 --> 00:00:20,000
Second, they avoids multitasking because it reduce focus.`;

export default function CaptionQCTool() {
  const [activeTab, setActiveTab] = useState("srt");
  const [driveLink, setDriveLink] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [srtText, setSrtText] = useState("");
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState("");
  const [results, setResults] = useState(null);
  const [apiError, setApiError] = useState("");
  const fileInputRef = useRef(null);
  const dragRef = useRef(null);

  const tabs = [
    { id: "srt", label: "SRT / Caption File" },
    { id: "youtube", label: "YouTube" },
    { id: "drive", label: "Google Drive" },
    { id: "video", label: "Upload File" },
  ];

  const handleFileSelect = (file) => {
    if (!file) return;
    setUploadedFileName(file.name);
    setUploadedFile(file);
  };

  const isReady = () => {
    if (activeTab === "srt") return srtText.trim().length > 10;
    if (activeTab === "video") return !!uploadedFile;
    if (activeTab === "drive") return driveLink.trim().length > 10;
    if (activeTab === "youtube") return youtubeLink.trim().length > 10;
    return false;
  };

  const analyze = async () => {
    setLoading(true);
    setApiError("");
    setResults(null);

    try {
      let response;

      if (activeTab === "youtube") {
        setLoadingMsg("Fetching captions from YouTube...");
        response = await fetch(`${API_BASE}/api/analyze/youtube`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: youtubeLink }),
        });

      } else if (activeTab === "drive") {
        setLoadingMsg("Downloading caption file from Google Drive...");
        response = await fetch(`${API_BASE}/api/analyze/drive`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: driveLink }),
        });

      } else if (activeTab === "srt") {
        setLoadingMsg("Analyzing captions...");
        response = await fetch(`${API_BASE}/api/analyze/srt`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: srtText }),
        });

      } else if (activeTab === "video") {
        setLoadingMsg("Uploading file and extracting captions...");
        const formData = new FormData();
        formData.append("file", uploadedFile);
        response = await fetch(`${API_BASE}/api/analyze/upload`, {
          method: "POST",
          body: formData,
        });
      }

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setLoadingMsg("Running AI quality check...");
      setResults(data);

    } catch (err) {
      if (err.message.includes("fetch") || err.message.includes("network") || err.message.includes("Failed to fetch")) {
        setApiError(`Cannot connect to backend at ${API_BASE}. Make sure your backend server is running.`);
      } else {
        setApiError(err.message);
      }
    } finally {
      setLoading(false);
      setLoadingMsg("");
    }
  };

  const reset = () => {
    setResults(null);
    setApiError("");
    setSrtText("");
    setDriveLink("");
    setYoutubeLink("");
    setUploadedFile(null);
    setUploadedFileName("");
  };

  const spellingCount = results?.errors?.filter((e) => e.type === "spelling").length || 0;
  const grammarCount = results?.errors?.filter((e) => e.type === "grammar").length || 0;

  const highlightError = (text, phrase) => {
    if (!phrase || !text.includes(phrase)) return <span>{text}</span>;
    const parts = text.split(phrase);
    return parts.map((part, i) => (
      <span key={i}>{part}{i < parts.length - 1 && <mark>{phrase}</mark>}</span>
    ));
  };

  return (
    <>
      <style>{styles}</style>
      <div className="app">
        <div className="header">
          <div className="badge">AI-Powered QC Tool</div>
          <h1>Caption<br /><span>Error Checker</span></h1>
          <p className="subtitle">
            Drop in your video link or caption file — we'll catch every spelling<br />
            and grammar mistake before it goes live.
          </p>
        </div>

        {!results && !loading && (
          <>
            <div className="source-tabs">
              {tabs.map((t) => (
                <button key={t.id} className={`tab-btn ${activeTab === t.id ? "active" : ""}`} onClick={() => setActiveTab(t.id)}>
                  {t.label}
                </button>
              ))}
            </div>

            <div className="input-card">
              {activeTab === "srt" && (
                <>
                  <span className="input-label">Paste SRT or Caption Text</span>
                  <textarea
                    className="text-input"
                    placeholder={`Paste your .srt or .vtt content here...\n\n1\n00:00:01,000 --> 00:00:04,000\nYour caption text here`}
                    value={srtText}
                    onChange={(e) => setSrtText(e.target.value)}
                  />
                  <p className="hint" style={{display:"flex",gap:"12px",alignItems:"center"}}>
                    <span>Accepts SRT, VTT, or plain text captions</span>
                    <button style={{background:"none",border:"none",color:"var(--accent)",fontFamily:"inherit",fontSize:"11px",cursor:"pointer",textDecoration:"underline"}} onClick={() => setSrtText(SAMPLE_SRT)}>
                      Load sample ↗
                    </button>
                  </p>
                </>
              )}

              {activeTab === "youtube" && (
                <>
                  <span className="input-label">YouTube Video URL</span>
                  <input className="text-input" type="text" placeholder="https://youtube.com/watch?v=..." value={youtubeLink} onChange={(e) => setYoutubeLink(e.target.value)} />
                  <p className="hint">⚠ Video must have captions/subtitles enabled. Auto-generated captions are supported.</p>
                </>
              )}

              {activeTab === "drive" && (
                <>
                  <span className="input-label">Google Drive File Link</span>
                  <input className="text-input" type="text" placeholder="https://drive.google.com/file/d/..." value={driveLink} onChange={(e) => setDriveLink(e.target.value)} />
                  <p className="hint">⚠ File must be set to "Anyone with the link can view". Supports .srt, .vtt, .txt caption files.</p>
                </>
              )}

              {activeTab === "video" && (
                <>
                  <span className="input-label">Upload Caption or Video File</span>
                  <div
                    ref={dragRef}
                    className="upload-zone"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); dragRef.current?.classList.add("dragover"); }}
                    onDragLeave={() => dragRef.current?.classList.remove("dragover")}
                    onDrop={(e) => { e.preventDefault(); dragRef.current?.classList.remove("dragover"); handleFileSelect(e.dataTransfer.files[0]); }}
                  >
                    <div className="upload-icon">📄</div>
                    <div className="upload-text">
                      <strong>Click to upload</strong> or drag and drop<br />
                      .srt, .vtt, .txt caption files
                    </div>
                    {uploadedFileName && <div className="file-name">✓ {uploadedFileName}</div>}
                  </div>
                  <input ref={fileInputRef} type="file" accept=".srt,.vtt,.txt" style={{display:"none"}} onChange={(e) => handleFileSelect(e.target.files[0])} />
                </>
              )}
            </div>

            {apiError && (
              <div className="error-box">
                <strong>Error</strong>
                {apiError}
              </div>
            )}

            <button className="analyze-btn" onClick={analyze} disabled={!isReady()}>
              <span>↗</span> Analyze Captions
            </button>
          </>
        )}

        {loading && (
          <div className="loading-state">
            <div className="spinner" />
            <div className="loading-text">
              <strong>{loadingMsg || "Analyzing captions..."}</strong>
              Checking for spelling errors, grammar issues, and language problems
            </div>
          </div>
        )}

        {results && (
          <div className="results">
            <div className="results-header">
              <div className="results-title">QC Report</div>
              <div className="stats-row">
                <div className={`stat-chip ${results.errors_found === 0 ? "clean" : "errors"}`}>
                  {results.errors_found} issue{results.errors_found !== 1 ? "s" : ""} found
                </div>
                {spellingCount > 0 && <div className="stat-chip errors">{spellingCount} spelling</div>}
                {grammarCount > 0 && <div className="stat-chip warnings">{grammarCount} grammar</div>}
                <div className="stat-chip clean">{results.total_lines_checked} lines checked</div>
              </div>
            </div>

            {results.truncated && (
              <div className="truncated-note">⚠ Captions were very long — first portion analyzed. Split into smaller files for full coverage.</div>
            )}

            {results.summary && (
              <div className="summary-note">
                <span style={{color:"var(--accent)",fontSize:"10px",textTransform:"uppercase",letterSpacing:"0.1em",marginRight:"8px"}}>Summary</span>
                {results.summary}
              </div>
            )}

            {results.errors_found === 0 ? (
              <div className="all-clear">
                <div className="all-clear-icon">✅</div>
                <h3>All Clear!</h3>
                <p>No spelling or grammar errors detected across {results.total_lines_checked} caption lines.</p>
              </div>
            ) : (
              <div className="error-list">
                <p className="section-label">{results.errors_found} issue{results.errors_found !== 1 ? "s" : ""} detected</p>
                {results.errors.map((err, i) => (
                  <div key={i} className={`error-card ${err.type}`}>
                    <div className="error-top">
                      {(err.line_number || err.timestamp) && (
                        <span className="line-badge">
                          {err.timestamp ? `⏱ ${err.timestamp}` : `Line ${err.line_number}`}
                        </span>
                      )}
                      <span className={`error-type ${err.type}`}>{err.type}</span>
                      {err.explanation && <span style={{fontSize:"11px",color:"var(--muted)",flex:1}}>{err.explanation}</span>}
                    </div>
                    <div className="error-original">{highlightError(err.original_text, err.error_word_or_phrase)}</div>
                    <div className="error-suggestion">
                      <span className="suggestion-label">Fix →</span>{err.suggestion}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button className="reset-btn" onClick={reset}>← Check Another Video</button>
          </div>
        )}
      </div>
    </>
  );
}
