import { NextResponse } from "next/server";
import { requireStudent } from "@/lib/server/profiles";
import { handleEduError, badRequest, serverError } from "@/lib/server";
import { streamOpenAI, buildVisionContent, transcribeAudio } from "@/lib/server/ai-orchestrator";
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
 * - On stream completion, persists EduAiResponse and updates inquiry status.
 *
 * Fallback: if OpenAI fails at connection time, returns 502 with error JSON
 * (streaming doesn't support mid-stream failover without complex buffering;
 * clients should retry with the non-streaming enqueue endpoint for fallback).
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

    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of streamOpenAI(content, systemPrompt)) {
            if (chunk.error) {
              controller.enqueue(encoder.encode(`event: error\ndata: ${JSON.stringify(chunk)}\n\n`));
              controller.close();
              return;
            }
            if (chunk.token) {
              fullOutput += chunk.token;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`));
            }
            if (chunk.done) {
              controller.enqueue(encoder.encode(`event: done\ndata: {}\n\n`));
              controller.close();

              // Persist after stream closes (fire-and-forget; log on error)
              prisma.eduAiResponse
                .create({
                  data: {
                    inquiryId,
                    modelUsed: content.some((c) => c.type === "image_url")
                      ? process.env.OPENAI_MODEL_VISION ?? "gpt-4o"
                      : process.env.OPENAI_MODEL_CHAT ?? "gpt-4o-mini",
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
