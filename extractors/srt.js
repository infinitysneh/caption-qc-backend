function extractSRTCaptions(text) {
  if (!text || text.trim().length === 0) {
    throw new Error("Caption text is empty.");
  }

  const cleaned = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n").trim();

  if (cleaned.startsWith("WEBVTT")) {
    return parseVTT(cleaned);
  }

  if (/\d{2}:\d{2}:\d{2}[,\.]\d{3}\s*-->\s*\d{2}:\d{2}:\d{2}[,\.]\d{3}/.test(cleaned)) {
    return parseSRT(cleaned);
  }

  return parsePlainText(cleaned);
}

function parseSRT(text) {
  const blocks = text.split(/\n\s*\n/).filter((b) => b.trim());
  const lines = [];

  for (const block of blocks) {
    const blockLines = block.trim().split("\n");
    if (blockLines.length < 2) continue;

    let lineNumber = null, timestamp = null, textLines = [];

    for (let i = 0; i < blockLines.length; i++) {
      const line = blockLines[i].trim();
      if (i === 0 && /^\d+$/.test(line)) {
        lineNumber = parseInt(line);
      } else if (/\d{2}:\d{2}:\d{2}[,\.]\d{3}\s*-->/.test(line)) {
        timestamp = line.split("-->")[0].trim().replace(",", ".");
        const parts = timestamp.split(":");
        if (parts.length === 3) {
          const h = parseInt(parts[0]);
          const m = parseInt(parts[1]);
          const s = parts[2].split(".")[0];
          timestamp = h > 0 ? `${h}:${String(m).padStart(2,"0")}:${s}` : `${m}:${s}`;
        }
      } else if (line.length > 0) {
        textLines.push(line.replace(/<[^>]+>/g, ""));
      }
    }

    const captionText = textLines.join(" ").trim();
    if (captionText && lineNumber !== null) {
      lines.push({ lineNumber, timestamp, text: captionText });
    }
  }

  if (lines.length === 0) throw new Error("Could not parse any captions from the SRT content.");

  const rawText = lines.map((l) => `[${l.timestamp || l.lineNumber}] ${l.text}`).join("\n");
  return { lines, rawText };
}

function parseVTT(text) {
  const body = text.replace(/^WEBVTT.*\n/, "").trim();
  const srtLike = body.replace(/(\d{2}:\d{2}:\d{2}\.\d{3})/g, (m) => m.replace(".", ","));
  return parseSRT(srtLike);
}

function parsePlainText(text) {
  const rawLines = text.split("\n").filter((l) => l.trim().length > 0);
  const lines = rawLines.map((text, i) => ({ lineNumber: i + 1, timestamp: null, text: text.trim() }));
  const rawText = lines.map((l) => `[Line ${l.lineNumber}] ${l.text}`).join("\n");
  return { lines, rawText };
}

module.exports = { extractSRTCaptions };
