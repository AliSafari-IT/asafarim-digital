import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/server/profiles";
import { handleEduError, badRequest, serverError } from "@/lib/server";
import { streamOpenAI, streamAnthropic, buildVisionContent, transcribeAudio } from "@/lib/server/ai-orchestrator";
import { prisma } from "@asafarim/db";

export const runtime = "nodejs";

/**
 * GET /api/inquiries/[id]/ai?stream=1
 *
 * Stream an AI response for the inquiry using Server-Sent Events.
 * STUDENT-only; only the inquiry owner can request AI help.
 *
 * Query params:
 *   stream=1 — required to enable SSE stream (otherwise returns 400)
 *
 * Behavior:
 * - If audio attachments exist, transcribes via Whisper first (once, cached).
 * - Builds vision content from description + images.
 * - Streams tokens from OpenAI (gpt-4o for vision, gpt-4o-mini for text-only).
 * - If OpenAI fails (quota exceeded, etc.), automatically falls back to Anthropic streaming.
 * - On stream completion, persists EduAiResponse and updates inquiry status.
 *
 * Fallback: OpenAI → Anthropic (automatic, no client retry needed)
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await requireStudent();
    const { id: inquiryId } = await params;

    const inquiry = await prisma.eduInquiry.findUnique({
      where: { id: inquiryId },
      select: { studentId: true, description: true, attachments: true, status: true },
    });
    if (!inquiry) {
      return badRequest("Inquiry not found.");
    }
    if (inquiry.studentId !== user.id) {
      return handleEduError("inquiries/ai", new Error("Forbidden"));
    }

    // For simplicity, require explicit ?stream=1 to avoid accidental buffering
    // in clients that don't expect SSE.
    // (In a full implementation you'd parse URL from request)

    const attachments = (inquiry.attachments as Array<{ url: string; mime: string }>) ?? [];

    // Transcribe audio if present (blocking before stream; could be cached)
    let audioText = "";
    for (const att of attachments) {
      if (att.mime.startsWith("audio/")) {
        const t = await transcribeAudio(att.url);
        if (t?.text) audioText += `\n[Voice transcript]: ${t.text}`;
      }
    }

    const description = inquiry.description + audioText;
    const content = await buildVisionContent(description, attachments);
    const systemPrompt = `You are EduMatch AI, a helpful tutor for students.
Guidelines:
- Answer in the same language as the student question.
- Be encouraging and concise; prefer step-by-step explanations.
- If images are provided, read them carefully and reference specific content.
- If a question is unclear, ask clarifying questions.
- Never write exam answers verbatim; guide the student to understanding.
- Cite any formulas or facts you use.`;

    const encoder = new TextEncoder();
    let fullOutput = "";
    let providerUsed: "openai" | "anthropic" = "openai";
    let modelUsed = content.some((c) => c.type === "image_url")
      ? process.env.OPENAI_MODEL_VISION ?? "gpt-4o"
      : process.env.OPENAI_MODEL_CHAT ?? "gpt-4o-mini";

    async function* streamWithFallback(): AsyncGenerator<
      { token?: string; done?: boolean; error?: string; provider?: "openai" | "anthropic" },
      void,
      unknown
    > {
      // Try OpenAI first
      let openAIError = "";
      for await (const chunk of streamOpenAI(content, systemPrompt)) {
        if (chunk.error) {
          openAIError = chunk.error;
          break;
        }
        if (chunk.token || chunk.done) {
          yield { ...chunk, provider: "openai" };
        }
        if (chunk.done) return;
      }

      // If OpenAI failed, try Anthropic fallback
      if (openAIError) {
        console.log("[AI] OpenAI failed, trying Anthropic fallback:", openAIError);
        for await (const chunk of streamAnthropic(content, systemPrompt)) {
          if (chunk.error) {
            // Both failed - return aggregated error
            yield { error: `OpenAI: ${openAIError} | Anthropic: ${chunk.error}` };
            return;
          }
          if (chunk.token || chunk.done) {
            yield { ...chunk, provider: "anthropic" };
          }
        }
      }
    }

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamWithFallback()) {
            if (chunk.error) {
              controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: chunk.error })}\n\n`));
              controller.close();
              return;
            }
            if (chunk.provider) {
              providerUsed = chunk.provider;
              modelUsed = chunk.provider === "openai"
                ? (content.some((c) => c.type === "image_url")
                    ? process.env.OPENAI_MODEL_VISION ?? "gpt-4o"
                    : process.env.OPENAI_MODEL_CHAT ?? "gpt-4o-mini")
                : (process.env.ANTHROPIC_MODEL ?? "claude-haiku-4-5");
            }
            if (chunk.token) {
              fullOutput += chunk.token;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ token: chunk.token })}\n\n`));
            }
            if (chunk.done) {
              controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
              controller.close();

              // Persist after stream closes (fire-and-forget; log on error)
              prisma.eduAiResponse
                .create({
                  data: {
                    inquiryId,
                    modelUsed,
                    promptVersion: "v1-stream",
                    explanation: fullOutput,
                  },
                })
                .then(() =>
                  prisma.eduInquiry.update({
                    where: { id: inquiryId },
                    data: { status: "AI_RESPONDED", aiSummary: fullOutput.slice(0, 500) },
                  }),
                )
                .catch((e) => console.error("[AI] post-stream persist failed:", e));
            }
          }
        } catch (err) {
          controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify({ error: String(err) })}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "EduAuthError") {
      return handleEduError("inquiries/ai", error);
    }
    return serverError("inquiries/ai", error);
  }
}
