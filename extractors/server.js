require("dotenv").config();
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const Anthropic = require("@anthropic-ai/sdk");

const { extractYouTubeCaptions } = require("./extractors/youtube");
const { extractDriveCaptions } = require("./extractors/drive");
const { extractSRTCaptions } = require("./extractors/srt");
const { analyzeWithClaude } = require("./analyzer");

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 50 * 1024 * 1024 } });

app.use(cors({
  origin: process.env.FRONTEND_URL || "*",
  methods: ["GET", "POST"],
}));
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", version: "1.0.0" });
});

// ── YouTube route ──────────────────────────────────────────────
app.post("/api/analyze/youtube", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "YouTube URL is required" });

    console.log(`[YouTube] Extracting captions from: ${url}`);
    const captions = await extractYouTubeCaptions(url);

    console.log(`[YouTube] Got ${captions.lines.length} caption lines, analyzing...`);
    const result = await analyzeWithClaude(captions);

    res.json({ success: true, source: "youtube", url, ...result });
  } catch (err) {
    console.error("[YouTube] Error:", err.message);
    res.status(500).json({ error: err.message || "Failed to process YouTube video" });
  }
});

// ── Google Drive route ─────────────────────────────────────────
app.post("/api/analyze/drive", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "Google Drive URL is required" });

    console.log(`[Drive] Extracting captions from: ${url}`);
    const captions = await extractDriveCaptions(url);

    console.log(`[Drive] Got ${captions.lines.length} caption lines, analyzing...`);
    const result = await analyzeWithClaude(captions);

    res.json({ success: true, source: "drive", url, ...result });
  } catch (err) {
    console.error("[Drive] Error:", err.message);
    res.status(500).json({ error: err.message || "Failed to process Google Drive file" });
  }
});

// ── SRT paste route ────────────────────────────────────────────
app.post("/api/analyze/srt", async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || text.trim().length < 10) {
      return res.status(400).json({ error: "Caption text is required" });
    }

    const captions = extractSRTCaptions(text);
    const result = await analyzeWithClaude(captions);

    res.json({ success: true, source: "srt", ...result });
  } catch (err) {
    console.error("[SRT] Error:", err.message);
    res.status(500).json({ error: err.message || "Failed to analyze captions" });
  }
});

// ── File upload route ──────────────────────────────────────────
app.post("/api/analyze/upload", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "No file uploaded" });

    const fileText = req.file.buffer.toString("utf-8");
    const captions = extractSRTCaptions(fileText);
    const result = await analyzeWithClaude(captions);

    res.json({ success: true, source: "upload", filename: req.file.originalname, ...result });
  } catch (err) {
    console.error("[Upload] Error:", err.message);
    res.status(500).json({ error: err.message || "Failed to analyze uploaded file" });
  }
});

// ── Start server ───────────────────────────────────────────────
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`✅ Caption QC backend running on port ${PORT}`);
  console.log(`   Anthropic API key: ${process.env.ANTHROPIC_API_KEY ? "✓ set" : "✗ MISSING"}`);
  console.log(`   Google Drive API:  ${process.env.GOOGLE_DRIVE_API_KEY ? "✓ set" : "○ optional"}`);
});
