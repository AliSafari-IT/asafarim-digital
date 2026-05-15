const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_API_KEY ? "claude-sonnet-4-5" : "claude-haiku-4-5";

function parsePositiveInt(value: string | undefined, fallback: number): number {
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const OPENAI_MAX_OUTPUT_TOKENS = parsePositiveInt(process.env.OPENAI_MAX_OUTPUT_TOKENS, 4000);
const ANTHROPIC_MAX_TOKENS = parsePositiveInt(process.env.ANTHROPIC_MAX_TOKENS, 4000);

export type ProviderSuccess = {
  output: string;
  provider: "openai" | "anthropic";
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
  truncated?: boolean;
  stopReason?: string;
};

export type ProviderFailure = {
  error: string;
};

export type ProviderResult = ProviderSuccess | ProviderFailure;

function extractOpenAIText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };
  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }
  const chunks = data.output?.flatMap((item) => item.content ?? []) ?? [];
  const text = chunks
    .filter((c) => c.type === "output_text" && typeof c.text === "string")
    .map((c) => c.text)
    .join("\n")
    .trim();
  return text || null;
}

function extractAnthropicText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") return null;
  const data = payload as { content?: Array<{ type?: string; text?: string }> };
  const text = data.content
    ?.filter((c) => c.type === "text" && typeof c.text === "string")
    .map((c) => c.text)
    .join("\n")
    .trim();
  return text || null;
}

function getProviderError(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object" || !("error" in payload)) return undefined;
  const err = (payload as { error?: { message?: string } }).error;
  return typeof err?.message === "string" ? err.message : undefined;
}

export async function generateWithOpenAI(
  systemPrompt: string,
  userPrompt: string,
): Promise<ProviderResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return { error: "OPENAI_API_KEY is not configured." };

  const upstream = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      max_output_tokens: OPENAI_MAX_OUTPUT_TOKENS,
      input: [
        { role: "system", content: [{ type: "input_text", text: systemPrompt }] },
        { role: "user", content: [{ type: "input_text", text: userPrompt }] },
      ],
    }),
  });

  const payload = (await upstream.json()) as unknown;
  if (!upstream.ok) {
    return { error: getProviderError(payload) ?? "OpenAI request failed." };
  }
  const output = extractOpenAIText(payload);
  if (!output) return { error: "OpenAI returned an empty response." };

  const data = payload as {
    usage?: { input_tokens?: number; output_tokens?: number; total_tokens?: number };
    status?: string;
    incomplete_details?: { reason?: string };
  };
  const stopReason = data.incomplete_details?.reason ?? data.status;
  const truncated = data.incomplete_details?.reason === "max_output_tokens";
  return {
    output,
    provider: "openai",
    model: OPENAI_MODEL,
    promptTokens: data.usage?.input_tokens,
    completionTokens: data.usage?.output_tokens,
    totalTokens: data.usage?.total_tokens,
    truncated,
    stopReason,
  };
}

export async function generateWithAnthropic(
  systemPrompt: string,
  userPrompt: string,
): Promise<ProviderResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return { error: "ANTHROPIC_API_KEY is not configured." };

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: ANTHROPIC_MAX_TOKENS,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  const payload = (await upstream.json()) as unknown;
  if (!upstream.ok) {
    return { error: getProviderError(payload) ?? "Anthropic request failed." };
  }
  const output = extractAnthropicText(payload);
  if (!output) return { error: "Anthropic returned an empty response." };

  const data = payload as {
    usage?: { input_tokens?: number; output_tokens?: number };
    stop_reason?: string;
  };
  const promptTokens = data.usage?.input_tokens;
  const completionTokens = data.usage?.output_tokens;
  return {
    output,
    provider: "anthropic",
    model: ANTHROPIC_MODEL,
    promptTokens,
    completionTokens,
    totalTokens:
      typeof promptTokens === "number" && typeof completionTokens === "number"
        ? promptTokens + completionTokens
        : undefined,
    truncated: data.stop_reason === "max_tokens",
    stopReason: data.stop_reason,
  };
}

export type StoryPromptContext = {
  locale: string;
  mode: "story" | "slideshow" | "documentary";
  storyMode?: string;
  userNotes?: string;
  captions?: string[];
  exifSummary?: string;
};

export function buildStorySystemPrompt(locale: string): string {
  return `You are an expert multilingual storyteller and video scriptwriter for an AI-powered photo-to-story video creator called Vionto. Write warm, poetic, emotionally resonant narration that matches the selected locale language and cultural tone. Output ONLY a JSON object with two keys: "narration" (plain-text narration string) and "srt" (valid SRT subtitle string with timing cues). No markdown, no commentary outside the JSON.`;
}

export function buildStoryUserPrompt(ctx: StoryPromptContext): string {
  const lines: string[] = [];
  lines.push(`Locale: ${ctx.locale}`);
  lines.push(`Mode: ${ctx.mode}`);
  if (ctx.storyMode) {
    lines.push(`Story mode: ${ctx.storyMode}`);
  }
  if (ctx.userNotes && ctx.userNotes.trim()) {
    lines.push(`User notes: ${ctx.userNotes.trim()}`);
  }
  if (ctx.captions && ctx.captions.length > 0) {
    lines.push(`Image captions: ${ctx.captions.join("; ")}`);
  }
  if (ctx.exifSummary && ctx.exifSummary.trim()) {
    lines.push(`Photo metadata: ${ctx.exifSummary.trim()}`);
  }
  lines.push("");
  lines.push("Instructions:");
  
  // Add story mode-specific instructions
  if (ctx.storyMode === "memory_film") {
    lines.push("- Write an emotional, cinematic narration for personal memories and reflective albums.");
    lines.push("- Focus on feelings, nostalgia, and the emotional arc of the memories.");
  } else if (ctx.storyMode === "travel_recap") {
    lines.push("- Write a location-aware recap for trips, routes, and highlights.");
    lines.push("- Emphasize date/place progression and the journey narrative.");
  } else if (ctx.storyMode === "family_archive") {
    lines.push("- Write warm, chronological, people-focused storytelling for family albums.");
    lines.push("- Focus on relationships, generations, and family milestones.");
  } else if (ctx.storyMode === "event_recap") {
    lines.push("- Write a highlight-driven recap for weddings, birthdays, graduations, parties, and gatherings.");
    lines.push("- Focus on key moments, celebrations, and event highlights.");
  } else if (ctx.storyMode === "social_reel") {
    lines.push("- Write short, fast-paced narration optimized for vertical social media (Reels, TikTok, Shorts).");
    lines.push("- Use punchy, engaging language that works well in short form.");
  } else if (ctx.storyMode === "documentary") {
    lines.push("- Write slower, more factual narration with emphasis on timeline, context, and observed details.");
    lines.push("- Focus on historical context and factual accuracy.");
  } else {
    lines.push("- Write a cohesive narration that flows across the provided images.");
  }
  
  lines.push("- The SRT output should have one cue per sentence, with reasonable timing spaced roughly 3-6 seconds per cue for a ~30-60 second total duration.");
  lines.push("- Escape angle brackets in SRT text as &lt; and &gt;.");
  lines.push("- Do not include empty lines inside a cue text block.");
  lines.push("- Output JSON only.");
  return lines.join("\n");
}
