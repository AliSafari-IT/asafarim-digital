/**
 * SRT (SubRip Subtitle) generation and validation utilities.
 *
 * SRT format:
 *   1
 *   00:00:01,000 --> 00:00:04,000
 *   First line of text.
 *
 *   2
 *   00:00:05,000 --> 00:00:07,000
 *   Second line.
 */

export type SrtCue = {
  index: number;
  startMs: number;
  endMs: number;
  text: string;
};

function msToSrtTime(ms: number): string {
  const hours = Math.floor(ms / 3_600_000);
  const minutes = Math.floor((ms % 3_600_000) / 60_000);
  const seconds = Math.floor((ms % 60_000) / 1000);
  const millis = Math.floor(ms % 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)},${String(millis).padStart(3, "0")}`;
}

/** Build a single SRT cue block. */
export function formatSrtCue(cue: SrtCue): string {
  const start = msToSrtTime(cue.startMs);
  const end = msToSrtTime(cue.endMs);
  return `${cue.index}\n${start} --> ${end}\n${cue.text}`;
}

/** Build a full SRT string from cues. */
export function buildSrt(cues: SrtCue[]): string {
  return cues.map(formatSrtCue).join("\n\n") + "\n";
}

/** Parse a simple SRT string back into cues ( tolerant of whitespace ). */
export function parseSrt(input: string): SrtCue[] {
  const cues: SrtCue[] = [];
  const blocks = input.replace(/\r\n/g, "\n").split(/\n{2,}/);
  for (const block of blocks) {
    const lines = block.trim().split("\n").filter(Boolean);
    if (lines.length < 2) continue;
    const idx = Number(lines[0]);
    if (!Number.isFinite(idx)) continue;
    const timeLine = lines[1];
    const match = timeLine.match(
      /(\d{2}:\d{2}:\d{2},\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2},\d{3})/
    );
    if (!match) continue;
    const text = lines.slice(2).join("\n");
    cues.push({
      index: idx,
      startMs: srtTimeToMs(match[1]),
      endMs: srtTimeToMs(match[2]),
      text,
    });
  }
  return cues;
}

function srtTimeToMs(t: string): number {
  const [h, m, sMs] = t.split(":");
  const [s, ms] = sMs.split(",");
  return (
    Number(h) * 3_600_000 +
    Number(m) * 60_000 +
    Number(s) * 1000 +
    Number(ms)
  );
}

/**
 * Generate evenly-timed SRT cues from a paragraph of text.
 *
 * Splits by sentence (naive: period / exclamation / question).
 * Each sentence gets a cue proportional to its word count.
 */
export function generateSrtFromText(
  text: string,
  startOffsetMs: number = 0,
  totalDurationMs: number = 30_000
): SrtCue[] {
  const sentences = text
    .replace(/([.!?])\s+/g, "$1\n")
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
  if (sentences.length === 0) return [];

  const wordCounts = sentences.map((s) => s.split(/\s+/).length);
  const totalWords = wordCounts.reduce((a, b) => a + b, 0);

  const cues: SrtCue[] = [];
  let cursorMs = startOffsetMs;

  for (let i = 0; i < sentences.length; i++) {
    const ratio = totalWords === 0 ? 1 / sentences.length : wordCounts[i] / totalWords;
    const durationMs = Math.max(1000, Math.round(totalDurationMs * ratio));
    const endMs = cursorMs + durationMs;
    cues.push({
      index: i + 1,
      startMs: cursorMs,
      endMs,
      text: sentences[i],
    });
    cursorMs = endMs;
  }

  return cues;
}

/** Validate that a string looks like valid SRT (at least one cue, well-formed timing). */
export function isValidSrt(input: string): boolean {
  const cues = parseSrt(input);
  if (cues.length === 0) return false;
  for (const cue of cues) {
    if (cue.startMs < 0 || cue.endMs < 0) return false;
    if (cue.endMs <= cue.startMs) return false;
    if (!cue.text.trim()) return false;
  }
  return true;
}
