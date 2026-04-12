import { NextResponse } from "next/server";

const VALID_TYPES = new Set(["blog", "product", "email", "social", "summary"]);

const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-3-5-sonnet-latest";

type GenerateRequest = {
  type?: string;
  input?: string;
};

type ProviderResult = {
  output?: string;
  error?: string;
};

function extractOutputText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const data = payload as {
    output_text?: string;
    output?: Array<{ content?: Array<{ type?: string; text?: string }> }>;
  };

  if (typeof data.output_text === "string" && data.output_text.trim()) {
    return data.output_text.trim();
  }

  const contentChunks = data.output?.flatMap((item) => item.content ?? []) ?? [];
  const text = contentChunks
    .filter((chunk) => chunk.type === "output_text" && typeof chunk.text === "string")
    .map((chunk) => chunk.text)
    .join("\n")
    .trim();

  return text || null;
}

function extractAnthropicText(payload: unknown): string | null {
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const data = payload as {
    content?: Array<{ type?: string; text?: string }>;
  };

  const text = data.content
    ?.filter((chunk) => chunk.type === "text" && typeof chunk.text === "string")
    .map((chunk) => chunk.text)
    .join("\n")
    .trim();

  return text || null;
}

function getProviderError(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object" || !("error" in payload)) {
    return undefined;
  }

  const errorData = (payload as { error?: { message?: string } }).error;
  return typeof errorData?.message === "string" ? errorData.message : undefined;
}

async function generateWithOpenAI(systemPrompt: string, modelInput: string): Promise<ProviderResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { error: "OPENAI_API_KEY is not configured." };
  }

  const upstream = await fetch("https://api.openai.com/v1/responses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      input: [
        {
          role: "system",
          content: [{ type: "input_text", text: systemPrompt }],
        },
        {
          role: "user",
          content: [{ type: "input_text", text: modelInput }],
        },
      ],
    }),
  });

  const payload = (await upstream.json()) as unknown;
  if (!upstream.ok) {
    return { error: getProviderError(payload) ?? "OpenAI request failed." };
  }

  const output = extractOutputText(payload);
  if (!output) {
    return { error: "OpenAI returned an empty response." };
  }

  return { output };
}

async function generateWithAnthropic(systemPrompt: string, modelInput: string): Promise<ProviderResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return { error: "ANTHROPIC_API_KEY is not configured." };
  }

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
      messages: [
        {
          role: "user",
          content: modelInput,
        },
      ],
    }),
  });

  const payload = (await upstream.json()) as unknown;
  if (!upstream.ok) {
    return { error: getProviderError(payload) ?? "Anthropic request failed." };
  }

  const output = extractAnthropicText(payload);
  if (!output) {
    return { error: "Anthropic returned an empty response." };
  }

  return { output };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateRequest;

    const type = body.type?.trim().toLowerCase();
    const input = body.input?.trim();

    if (!type || !VALID_TYPES.has(type)) {
      return NextResponse.json({ error: "Invalid content type." }, { status: 400 });
    }

    if (!input || input.length < 12) {
      return NextResponse.json(
        { error: "Please provide a more detailed prompt (minimum 12 characters)." },
        { status: 400 },
      );
    }

    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        {
          error:
            "No AI provider key is configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY to enable generation.",
        },
        { status: 500 },
      );
    }

    const systemPrompt =
      "You are an expert SaaS content writer for asafarim-digital. Generate polished, clear, practical content with a confident but friendly tone.";

    const modelInput = `Content type: ${type}\n\nUser prompt:\n${input}\n\nRequirements:\n- Deliver production-ready copy\n- Keep structure readable\n- Avoid filler and generic claims\n- Use strong, outcome-oriented language`;

    const providerErrors: string[] = [];

    const openAIResult = await generateWithOpenAI(systemPrompt, modelInput);
    if (openAIResult.output) {
      return NextResponse.json({ output: openAIResult.output });
    }
    if (openAIResult.error) {
      providerErrors.push(`OpenAI: ${openAIResult.error}`);
    }

    const anthropicResult = await generateWithAnthropic(systemPrompt, modelInput);
    if (anthropicResult.output) {
      return NextResponse.json({ output: anthropicResult.output });
    }
    if (anthropicResult.error) {
      providerErrors.push(`Anthropic: ${anthropicResult.error}`);
    }

    const fallbackMessage = "Failed to generate content from all configured AI providers.";
    return NextResponse.json(
      { error: providerErrors.length > 0 ? providerErrors.join(" | ") : fallbackMessage },
      { status: 502 },
    );
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error while generating content." },
      { status: 500 },
    );
  }
}
