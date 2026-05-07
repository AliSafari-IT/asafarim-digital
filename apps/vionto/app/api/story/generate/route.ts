import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { getAuthedUser, unauthorized, badRequest, serverError } from "@/lib/server/auth";
import {
  generateWithOpenAI,
  generateWithAnthropic,
  buildStorySystemPrompt,
  buildStoryUserPrompt,
} from "@/lib/server/story-generation";
import { generateSrtFromText, isValidSrt } from "@/lib/server/srt";

export const runtime = "nodejs";

const MAX_NOTES_LENGTH = 2000;
const PROMPT_VERSION = "vionto-story-v1";

type GenerateBody = {
  projectId: string;
  locale?: string;
  mode?: "story" | "slideshow" | "documentary";
  userNotes?: string;
  captions?: string[];
  exifSummary?: string;
  totalDurationMs?: number;
};

export async function POST(req: Request) {
  try {
    const user = await getAuthedUser();
    if (!user) return unauthorized();

    let body: GenerateBody;
    try {
      body = (await req.json()) as GenerateBody;
    } catch {
      return badRequest("Invalid JSON body.");
    }

    const { projectId, locale = "en", mode = "story", userNotes, captions, exifSummary, totalDurationMs = 30_000 } = body;
    if (!projectId || typeof projectId !== "string") {
      return badRequest("projectId is required.");
    }
    if (userNotes && userNotes.length > MAX_NOTES_LENGTH) {
      return badRequest("userNotes exceeds maximum length.");
    }

    // Verify project ownership
    const project = await prisma.viontoProject.findFirst({
      where: { id: projectId, userId: user.id },
      select: { id: true, locale: true, mode: true },
    });
    if (!project) {
      return badRequest("Project not found.");
    }

    const effectiveLocale = locale || project.locale || "en";
    const effectiveMode = (mode || project.mode || "story") as "story" | "slideshow" | "documentary";

    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "No AI provider key is configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY." },
        { status: 500 },
      );
    }

    const systemPrompt = buildStorySystemPrompt(effectiveLocale);
    const userPrompt = buildStoryUserPrompt({
      locale: effectiveLocale,
      mode: effectiveMode,
      userNotes,
      captions,
      exifSummary,
    });

    const startedAt = Date.now();
    const errors: string[] = [];

    const openAIResult = await generateWithOpenAI(systemPrompt, userPrompt);
    let success = "output" in openAIResult ? openAIResult : null;
    if (!success && "error" in openAIResult) errors.push(`OpenAI: ${openAIResult.error}`);

    if (!success) {
      const anthropicResult = await generateWithAnthropic(systemPrompt, userPrompt);
      if ("output" in anthropicResult) {
        success = anthropicResult;
      } else {
        errors.push(`Anthropic: ${anthropicResult.error}`);
      }
    }

    const latencyMs = Date.now() - startedAt;

    if (!success) {
      const errorMessage = errors.length > 0 ? errors.join(" | ") : "Failed to generate story from all providers.";
      return NextResponse.json({ error: errorMessage }, { status: 502 });
    }

    // Parse JSON output from LLM (or fallback to plain text)
    let narration = success.output;
    let srtText: string | null = null;
    try {
      const parsed = JSON.parse(success.output) as { narration?: string; srt?: string };
      if (typeof parsed.narration === "string") narration = parsed.narration;
      if (typeof parsed.srt === "string") srtText = parsed.srt;
    } catch {
      // Not valid JSON; treat entire output as narration
    }

    // Fallback SRT generation if LLM didn't produce valid SRT
    if (!srtText || !isValidSrt(srtText)) {
      const cues = generateSrtFromText(narration, 0, totalDurationMs);
      const lines: string[] = [];
      for (const cue of cues) {
        lines.push(String(cue.index));
        const pad = (n: number) => String(n).padStart(2, "0");
        const fmt = (ms: number) => {
          const h = Math.floor(ms / 3_600_000);
          const m = Math.floor((ms % 3_600_000) / 60_000);
          const s = Math.floor((ms % 60_000) / 1000);
          const milli = Math.floor(ms % 1000);
          return `${pad(h)}:${pad(m)}:${pad(s)},${String(milli).padStart(3, "0")}`;
        };
        lines.push(`${fmt(cue.startMs)} --> ${fmt(cue.endMs)}`);
        lines.push(cue.text);
        lines.push("");
      }
      srtText = lines.join("\n");
    }

    // Persist script with provider metadata
    const script = await prisma.viontoScript.create({
      data: {
        projectId,
        userId: user.id,
        promptVersion: PROMPT_VERSION,
        provider: success.provider,
        model: success.model,
        narrationText: narration,
        srtText: srtText,
        promptTokens: success.promptTokens ?? null,
        completionTokens: success.completionTokens ?? null,
        totalTokens: success.totalTokens ?? null,
        latencyMs,
      },
    });

    return NextResponse.json({
      scriptId: script.id,
      narration,
      srt: srtText,
      provider: success.provider,
      model: success.model,
      latencyMs,
      tokens: {
        prompt: success.promptTokens,
        completion: success.completionTokens,
        total: success.totalTokens,
      },
    });
  } catch (error) {
    return serverError("story/generate", error);
  }
}
