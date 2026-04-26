import { prisma } from "@asafarim/db";

/**
 * Confirm that a folder exists and belongs to the given user.
 * Returns the folder id if valid, null otherwise.
 */
export async function assertFolderOwnership(
  folderId: string,
  userId: string,
): Promise<string | null> {
  const folder = await prisma.contentProjectFolder.findFirst({
    where: { id: folderId, userId },
    select: { id: true },
  });
  return folder?.id ?? null;
}

/**
 * Confirm that a chat session exists and belongs to the given user.
 */
export async function assertSessionOwnership(
  sessionId: string,
  userId: string,
): Promise<string | null> {
  const session = await prisma.contentChatSession.findFirst({
    where: { id: sessionId, userId },
    select: { id: true },
  });
  return session?.id ?? null;
}

/**
 * Confirm that a saved prompt exists and belongs to the given user.
 */
export async function assertPromptOwnership(
  promptId: string,
  userId: string,
): Promise<string | null> {
  const prompt = await prisma.savedPrompt.findFirst({
    where: { id: promptId, userId },
    select: { id: true },
  });
  return prompt?.id ?? null;
}
