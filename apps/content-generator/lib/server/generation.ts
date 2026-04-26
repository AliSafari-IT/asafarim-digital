const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-latest";

export type ProviderSuccess = {
  output: string;
  provider: "openai" | "anthropic";
  model: string;
  promptTokens?: number;
  completionTokens?: number;
  totalTokens?: number;
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

  const usage = (payload as { usage?: { input_tokens?: number; output_tokens?: number; total_tokens?: number } }).usage;
  return {
    output,
    provider: "openai",
    model: OPENAI_MODEL,
    promptTokens: usage?.input_tokens,
    completionTokens: usage?.output_tokens,
    totalTokens: usage?.total_tokens,
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
      max_tokens: 1200,
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

  const usage = (payload as { usage?: { input_tokens?: number; output_tokens?: number } }).usage;
  const promptTokens = usage?.input_tokens;
  const completionTokens = usage?.output_tokens;
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
  };
}

export function buildSystemPrompt(): string {
  return "You are an expert SaaS content writer for asafarim-digital. Generate polished, clear, practical content with a confident but friendly tone.";
}

export function buildUserPrompt(type: string, input: string): string {
  return `Content type: ${type}\n\nUser prompt:\n${input}\n\nRequirements:\n- Deliver production-ready copy\n- Keep structure readable\n- Avoid filler and generic claims\n- Use strong, outcome-oriented language`;
}
