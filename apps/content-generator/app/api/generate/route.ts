import { NextResponse } from "next/server";

const VALID_TYPES = new Set(["blog", "product", "email", "social", "summary"]);

type GenerateRequest = {
  type?: string;
  input?: string;
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

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error:
            "OPENAI_API_KEY is not configured. Add it to your environment variables to enable generation.",
        },
        { status: 500 },
      );
    }

    const systemPrompt =
      "You are an expert SaaS content writer for asafarim-digital. Generate polished, clear, practical content with a confident but friendly tone.";

    const modelInput = `Content type: ${type}\n\nUser prompt:\n${input}\n\nRequirements:\n- Deliver production-ready copy\n- Keep structure readable\n- Avoid filler and generic claims\n- Use strong, outcome-oriented language`;

    const upstream = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
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
      const fallbackMessage = "Failed to generate content from the AI provider.";
      const providerMessage =
        payload && typeof payload === "object" && "error" in payload
          ? (payload as { error?: { message?: string } }).error?.message
          : undefined;

      return NextResponse.json({ error: providerMessage ?? fallbackMessage }, { status: 502 });
    }

    const output = extractOutputText(payload);

    if (!output) {
      return NextResponse.json(
        { error: "The AI provider returned an empty response. Please try again." },
        { status: 502 },
      );
    }

    return NextResponse.json({ output });
  } catch {
    return NextResponse.json(
      { error: "Unexpected server error while generating content." },
      { status: 500 },
    );
  }
}
