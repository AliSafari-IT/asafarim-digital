const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-latest";

/**
 * Hard cap on tokens emitted by each provider. The previous default (1200)
 * truncated long-form outputs (blog posts, code-heavy answers) mid-sentence.
 * Override per environment via OPENAI_MAX_OUTPUT_TOKENS / ANTHROPIC_MAX_TOKENS.
 */
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
  /** True when the provider stopped because of the max-tokens cap. */
  truncated?: boolean;
  /** Raw provider stop signal, useful for debugging. */
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

export type ContentTypeContext = {
  slug: string;
  label: string;
  description?: string | null;
  promptInstructions?: string | null;
  systemPrompt?: string | null;
};

const BASE_SYSTEM_PROMPT =
  "You are an expert SaaS content writer for asafarim-digital. Generate polished, clear, practical content with a confident but friendly tone.";

export function buildSystemPrompt(type?: ContentTypeContext): string {
  if (type?.systemPrompt && type.systemPrompt.trim()) {
    return `${BASE_SYSTEM_PROMPT}\n\nAdditional guidance for ${type.label}:\n${type.systemPrompt.trim()}`;
  }
  return BASE_SYSTEM_PROMPT;
}

export function buildUserPrompt(
  type: string | ContentTypeContext,
  input: string,
): string {
  const ctx: ContentTypeContext =
    typeof type === "string"
      ? { slug: type, label: type }
      : type;

  const lines: string[] = [];
  lines.push(`Content type: ${ctx.label} (${ctx.slug})`);
  if (ctx.description && ctx.description.trim()) {
    lines.push(`Description: ${ctx.description.trim()}`);
  }
  if (ctx.promptInstructions && ctx.promptInstructions.trim()) {
    lines.push(`Instructions: ${ctx.promptInstructions.trim()}`);
  }
  lines.push("");
  lines.push("User prompt:");
  lines.push(input);
  lines.push("");
  lines.push("Requirements:");
  lines.push("- Deliver production-ready copy");
  lines.push("- Keep structure readable");
  lines.push("- Avoid filler and generic claims");
  lines.push("- Use strong, outcome-oriented language");
  return lines.join("\n");
}
