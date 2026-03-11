const { YoutubeTranscript } = require("youtube-transcript");

/**
 * Extracts captions from a YouTube video URL.
 * Returns { lines: [{ lineNumber, timestamp, text }], rawText }
 */
async function extractYouTubeCaptions(url) {
  const videoId = parseYouTubeId(url);
  if (!videoId) {
    throw new Error("Invalid YouTube URL. Please use a link like https://youtube.com/watch?v=XXXX");
  }

  let transcript;
  try {
    transcript = await YoutubeTranscript.fetchTranscript(videoId);
  } catch (err) {
    if (err.message?.includes("disabled")) {
      throw new Error("This video has captions/subtitles disabled. Try a video with captions turned on.");
    }
    throw new Error(`Could not fetch captions: ${err.message}`);
  }

  if (!transcript || transcript.length === 0) {
    throw new Error("No captions found for this video.");
  }

  const lines = transcript.map((item, index) => ({
    lineNumber: index + 1,
    timestamp: formatTimestamp(item.offset),
    text: item.text.replace(/\n/g, " ").trim(),
  }));

  const rawText = lines.map((l) => `[${l.timestamp}] ${l.text}`).join("\n");

  return { lines, rawText };
}

function parseYouTubeId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
    /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

function formatTimestamp(ms) {
  const totalSec = Math.floor(ms / 1000);
  const hours = Math.floor(totalSec / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  if (hours > 0) return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  return `${pad(minutes)}:${pad(seconds)}`;
}

function pad(n) {
  return String(n).padStart(2, "0");
}

module.exports = { extractYouTubeCaptions };
