import { describe, expect, it } from "vitest";

import {
  buildStorySystemPrompt,
  buildStoryUserPrompt,
} from "../story-generation";

describe("buildStorySystemPrompt", () => {
  it("mentions JSON-only output and locale", () => {
    const prompt = buildStorySystemPrompt("nl-BE");
    expect(prompt).toContain("JSON");
    expect(prompt).toContain("narration");
    expect(prompt).toContain("srt");
  });
});

describe("buildStoryUserPrompt snapshots", () => {
  it("matches snapshot for cinematic story with captions and exif", () => {
    const prompt = buildStoryUserPrompt({
      locale: "en",
      mode: "story",
      userNotes: "Make it nostalgic.",
      captions: ["Sunset over the canal", "Family dinner"],
      exifSummary: "Canon EOS R5, 2023-07-14, Amsterdam",
    });
    expect(prompt).toMatchInlineSnapshot(`
      "Locale: en
      Mode: story
      User notes: Make it nostalgic.
      Image captions: Sunset over the canal; Family dinner
      Photo metadata: Canon EOS R5, 2023-07-14, Amsterdam

      Instructions:
      - Write a cohesive narration that flows across the provided images.
      - The SRT output should have one cue per sentence, with reasonable timing spaced roughly 3-6 seconds per cue for a ~30-60 second total duration.
      - Escape angle brackets in SRT text as &lt; and &gt;.
      - Do not include empty lines inside a cue text block.
      - Output JSON only."
    `);
  });

  it("matches snapshot for minimal slideshow without extras", () => {
    const prompt = buildStoryUserPrompt({
      locale: "fr",
      mode: "slideshow",
    });
    expect(prompt).toMatchInlineSnapshot(`
      "Locale: fr
      Mode: slideshow

      Instructions:
      - Write a cohesive narration that flows across the provided images.
      - The SRT output should have one cue per sentence, with reasonable timing spaced roughly 3-6 seconds per cue for a ~30-60 second total duration.
      - Escape angle brackets in SRT text as &lt; and &gt;.
      - Do not include empty lines inside a cue text block.
      - Output JSON only."
    `);
  });
});
