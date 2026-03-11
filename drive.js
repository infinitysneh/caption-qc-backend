const axios = require("axios");

/**
 * Extracts captions from a Google Drive file link.
 * Supports: .srt, .vtt, .txt caption files shared via Drive.
 * Returns { lines: [{ lineNumber, timestamp, text }], rawText }
 */
async function extractDriveCaptions(url) {
  const fileId = parseDriveFileId(url);
  if (!fileId) {
    throw new Error("Invalid Google Drive URL. Please share a direct file link.");
  }

  // Try direct download URL
  const downloadUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;

  let fileContent;
  try {
    const response = await axios.get(downloadUrl, {
      timeout: 15000,
      maxRedirects: 5,
      responseType: "text",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; CaptionQC/1.0)",
      },
    });

    fileContent = response.data;

    // Google Drive returns an HTML confirmation page for large files
    if (typeof fileContent === "string" && fileContent.includes("Google Drive - Virus scan warning")) {
      throw new Error(
        "File is too large for direct download. Please use a smaller caption file, or share an .srt/.vtt file instead."
      );
    }

    // Check if we got an HTML page instead of a caption file
    if (typeof fileContent === "string" && fileContent.trim().startsWith("<!DOCTYPE")) {
      throw new Error(
        "Could not access this file. Make sure the file is set to 'Anyone with the link can view' and is a caption file (.srt, .vtt, or .txt)."
      );
    }
  } catch (err) {
    if (err.response?.status === 403) {
      throw new Error("Access denied. Make sure the Drive file is set to 'Anyone with the link can view'.");
    }
    if (err.response?.status === 404) {
      throw new Error("File not found. Check that the Drive link is correct.");
    }
    throw new Error(err.message || "Failed to download file from Google Drive.");
  }

  // Parse the content as SRT/VTT/plain text
  const { extractSRTCaptions } = require("./srt");
  return extractSRTCaptions(fileContent);
}

function parseDriveFileId(url) {
  const patterns = [
    /\/file\/d\/([a-zA-Z0-9_-]+)/,
    /id=([a-zA-Z0-9_-]+)/,
    /\/d\/([a-zA-Z0-9_-]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

module.exports = { extractDriveCaptions };
