import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";

import { badRequest, getAuthedUser, unauthorized } from "@/lib/server/auth";
import {
  generateWithAnthropic,
  generateWithOpenAI,
  buildSystemPrompt,
  buildUserPrompt,
} from "@/lib/server/generation";
import {
  assertFolderOwnership,
  assertSessionOwnership,
} from "@/lib/server/ownership";
import { assertContentTypeAvailable } from "@/lib/server/content-types";
import {
  MAX_PROMPT_LENGTH,
  MIN_PROMPT_LENGTH,
} from "@/lib/server/validation";

type GenerateBody = {
  type?: string;
  input?: string;
  folderId?: string | null;
  sessionId?: string | null;
};

function deriveSessionTitle(input: string, label: string): string {
  const snippet = input.trim().slice(0, 60).replace(/\s+/g, " ");
  return snippet ? `${label}: ${snippet}` : `${label} session`;
}

export async function POST(request: Request) {
  const user = await getAuthedUser();
  if (!user) return unauthorized();

  let body: GenerateBody;
  try {
    body = (await request.json()) as GenerateBody;
  } catch {
    return badRequest("Invalid JSON body.");
  }

  const rawType = typeof body.type === "string" ? body.type : "";
  const input = body.input?.trim();

  const typeDef = await assertContentTypeAvailable(rawType, user);
  if (!typeDef) {
    return badRequest("Invalid or unavailable content type.");
  }
  const type = typeDef.slug;
  if (!input || input.length < MIN_PROMPT_LENGTH) {
    return badRequest(
      `Please provide a more detailed prompt (minimum ${MIN_PROMPT_LENGTH} characters).`,
    );
  }
  if (input.length > MAX_PROMPT_LENGTH) {
    return badRequest(`Prompt exceeds maximum length of ${MAX_PROMPT_LENGTH} characters.`);
  }

  // Validate optional folder / session ownership.
  let folderId: string | null = null;
  if (typeof body.folderId === "string" && body.folderId.length > 0) {
    folderId = await assertFolderOwnership(body.folderId, user.id);
    if (!folderId) return badRequest("Folder not found.");
  }

  let sessionId: string | null = null;
  if (typeof body.sessionId === "string" && body.sessionId.length > 0) {
    sessionId = await assertSessionOwnership(body.sessionId, user.id);
    if (!sessionId) return badRequest("Session not found.");
  }

  // Ensure provider keys are configured before persisting work.
  if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      {
        error:
          "No AI provider key is configured. Set OPENAI_API_KEY or ANTHROPIC_API_KEY to enable generation.",
      },
      { status: 500 },
    );
  }

  // Create a session on-the-fly if none was supplied.
  if (!sessionId) {
    const created = await prisma.contentChatSession.create({
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        folderId,
        title: deriveSessionTitle(input, typeDef.label),
        contentType: type,
        lastMessageAt: new Date(),
      },
      select: { id: true },
    });
    sessionId = created.id;
  }

  // Persist the user prompt as a chat message BEFORE calling the provider.
  await prisma.contentChatMessage.create({
    data: {
      sessionId: sessionId!,
      role: "user",
      content: input,
      contentType: type,
    },
  });

  const typeContext = {
    slug: typeDef.slug,
    label: typeDef.label,
    description: typeDef.description,
    promptInstructions: typeDef.promptInstructions,
    systemPrompt: typeDef.systemPrompt,
  };
  const systemPrompt = buildSystemPrompt(typeContext);
  const modelInput = buildUserPrompt(typeContext, input);

  const errors: string[] = [];
  const openAIResult = await generateWithOpenAI(systemPrompt, modelInput);
  let success = "output" in openAIResult ? openAIResult : null;
  if (!success && "error" in openAIResult) errors.push(`OpenAI: ${openAIResult.error}`);

  if (!success) {
    const anthropicResult = await generateWithAnthropic(systemPrompt, modelInput);
    if ("output" in anthropicResult) {
      success = anthropicResult;
    } else {
      errors.push(`Anthropic: ${anthropicResult.error}`);
    }
  }

  if (!success) {
    const errorMessage =
      errors.length > 0
        ? errors.join(" | ")
        : "Failed to generate content from all configured AI providers.";

    const generation = await prisma.contentGeneration.create({
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        folderId,
        sessionId,
        contentType: type,
        prompt: input,
        status: "failed",
        error: errorMessage,
      },
      select: { id: true },
    });

    await prisma.contentChatSession.update({
      where: { id: sessionId! },
      data: { lastMessageAt: new Date() },
    });

    return NextResponse.json(
      { error: errorMessage, sessionId, generationId: generation.id },
      { status: 502 },
    );
  }

  // Persist assistant message + generation record in parallel with session update.
  const [assistantMessage, generation] = await Promise.all([
    prisma.contentChatMessage.create({
      data: {
        sessionId: sessionId!,
        role: "assistant",
        content: success.output,
        contentType: type,
        provider: success.provider,
        model: success.model,
      },
      select: { id: true },
    }),
    prisma.contentGeneration.create({
      data: {
        userId: user.id,
        tenantId: user.tenantId,
        folderId,
        sessionId,
        contentType: type,
        prompt: input,
        output: success.output,
        provider: success.provider,
        model: success.model,
        status: "succeeded",
        promptTokens: success.promptTokens,
        completionTokens: success.completionTokens,
        totalTokens: success.totalTokens,
      },
      select: { id: true },
    }),
    prisma.contentChatSession.update({
      where: { id: sessionId! },
      data: { lastMessageAt: new Date() },
    }),
  ]);

  return NextResponse.json({
    output: success.output,
    sessionId,
    generationId: generation.id,
    messageId: assistantMessage.id,
    provider: success.provider,
    model: success.model,
    truncated: success.truncated ?? false,
    stopReason: success.stopReason,
  });
}
