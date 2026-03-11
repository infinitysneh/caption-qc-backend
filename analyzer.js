const Anthropic = require("@anthropic-ai/sdk");

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

/**
 * Sends captions to Claude for spelling + grammar QC.
 * @param {{ lines: Array, rawText: string }} captions
 */
async function analyzeWithClaude(captions) {
  const { lines, rawText } = captions;

  // Chunk if very long (Claude handles ~4000 lines fine, but let's be safe)
  const MAX_CHARS = 12000;
  let textToAnalyze = rawText;
  let truncated = false;

  if (rawText.length > MAX_CHARS) {
    textToAnalyze = rawText.substring(0, MAX_CHARS);
    truncated = true;
  }

  const prompt = `You are a professional video caption quality control (QC) reviewer. Your job is to find ONLY spelling errors and grammar errors in the following video captions.

CAPTIONS TO REVIEW:
${textToAnalyze}
${truncated ? "\n[Note: Captions were truncated due to length. First portion analyzed.]" : ""}

Return a JSON object with EXACTLY this structure (no extra text, no markdown, just raw JSON):
{
  "total_lines_checked": <number of caption lines reviewed>,
  "errors_found": <total number of errors>,
  "errors": [
    {
      "line_number": <number or null>,
      "timestamp": "<string like '01:23' or null>",
      "type": "spelling" or "grammar",
      "original_text": "<full caption line containing the error>",
      "error_word_or_phrase": "<the exact wrong word or phrase>",
      "suggestion": "<the corrected full caption line>",
      "explanation": "<one short sentence explaining the error>"
    }
  ],
  "summary": "<1-2 sentence summary of overall caption quality>"
}

Rules:
- Only flag real errors, not stylistic choices or intentional informal language
- For spelling: flag misspelled words (e.g. "welcom" → "welcome")
- For grammar: flag wrong verb forms, wrong homophones (your/you're, their/they're), missing words, etc.
- Be thorough — catch every real error
- "error_word_or_phrase" must be the EXACT string as it appears in original_text so it can be highlighted
- Return ONLY valid JSON with no preamble, explanation, or markdown formatting`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2000,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.content.map((b) => b.text || "").join("");
  const clean = raw.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(clean);
  } catch (e) {
    throw new Error("Claude returned an unexpected response format. Please try again.");
  }

  return {
    total_lines_checked: parsed.total_lines_checked ?? lines.length,
    errors_found: parsed.errors_found ?? parsed.errors?.length ?? 0,
    errors: parsed.errors ?? [],
    summary: parsed.summary ?? "",
    truncated,
  };
}

module.exports = { analyzeWithClaude };
