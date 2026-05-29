/**
 * Two-way verification message thread between admins and a tutor.
 *
 * The thread is keyed by `tutorId` (the verification subject). Each message
 * records whether it came from an ADMIN or the TUTOR. Posting a message
 * notifies the opposite party (in-app + best-effort email) and emits an audit
 * event. `readAt` is stamped when the *recipient* opens the thread, powering
 * unread badges on both sides.
 */

import { prisma } from "@asafarim/db";
import { recordEduAuditEvent } from "./audit";
import { notifyVerificationMessage } from "./notifications";

export type ThreadRole = "ADMIN" | "TUTOR";

export type VerificationMessageView = {
  id: string;
  senderRole: ThreadRole;
  senderId: string;
  senderName: string | null;
  body: string;
  readAt: string | null;
  createdAt: string;
};

const MAX_BODY = 4000;

/** Normalize + validate a message body. Throws on empty/oversized. */
function normalizeBody(raw: unknown): string {
  const body = typeof raw === "string" ? raw.trim() : "";
  if (!body) throw new Error("Message body is required.");
  if (body.length > MAX_BODY) {
    throw new Error(`Message must be ${MAX_BODY} characters or fewer.`);
  }
  return body;
}

/**
 * Post a message to a tutor's verification thread and notify the other party.
 *
 * - ADMIN message → notifies the tutor.
 * - TUTOR message → notifies the admin who last reviewed them (if known).
 */
export async function postVerificationMessage(input: {
  tutorId: string;
  senderId: string;
  senderRole: ThreadRole;
  body: string;
}): Promise<{ id: string }> {
  const body = normalizeBody(input.body);

  const row = await prisma.eduVerificationMessage.create({
    data: {
      tutorId: input.tutorId,
      senderId: input.senderId,
      senderRole: input.senderRole,
      body,
    },
    select: { id: true },
  });

  // Resolve recipient + a short preview for the notification.
  const preview = body.length > 140 ? `${body.slice(0, 137)}…` : body;

  if (input.senderRole === "ADMIN") {
    await notifyVerificationMessage({ recipientId: input.tutorId, preview });
  } else {
    // Notify the most recent reviewer of this tutor, if any.
    const lastReview = await prisma.eduTutorVerification.findFirst({
      where: { tutorId: input.tutorId, reviewerId: { not: null } },
      orderBy: { createdAt: "desc" },
      select: { reviewerId: true },
    });
    if (lastReview?.reviewerId) {
      await notifyVerificationMessage({
        recipientId: lastReview.reviewerId,
        preview,
        forAdmin: true,
        tutorId: input.tutorId,
      });
    }
  }

  await recordEduAuditEvent({
    actorId: input.senderId,
    actorRole: input.senderRole,
    action: "TUTOR_VERIFICATION_MESSAGE_SENT",
    entity: "EduVerificationMessage",
    entityId: row.id,
    metadata: { tutorId: input.tutorId, senderRole: input.senderRole },
  });

  return row;
}

/** Full thread (oldest first) with sender display names. */
export async function listVerificationThread(
  tutorId: string,
): Promise<VerificationMessageView[]> {
  const rows = await prisma.eduVerificationMessage.findMany({
    where: { tutorId },
    orderBy: { createdAt: "asc" },
    include: { sender: { select: { name: true } } },
  });
  return rows.map((m) => ({
    id: m.id,
    senderRole: m.senderRole as ThreadRole,
    senderId: m.senderId,
    senderName: m.sender?.name ?? null,
    body: m.body,
    readAt: m.readAt ? m.readAt.toISOString() : null,
    createdAt: m.createdAt.toISOString(),
  }));
}

/**
 * Mark messages from the *other* role as read. When the tutor opens the
 * thread, ADMIN messages are marked read; when an admin opens it, TUTOR
 * messages are marked read.
 */
export async function markThreadRead(
  tutorId: string,
  readerRole: ThreadRole,
): Promise<number> {
  const otherRole: ThreadRole = readerRole === "ADMIN" ? "TUTOR" : "ADMIN";
  const result = await prisma.eduVerificationMessage.updateMany({
    where: { tutorId, senderRole: otherRole, readAt: null },
    data: { readAt: new Date() },
  });
  return result.count;
}

/** Count messages the tutor hasn't read yet (i.e. unread ADMIN messages). */
export async function countUnreadForTutor(tutorId: string): Promise<number> {
  return prisma.eduVerificationMessage.count({
    where: { tutorId, senderRole: "ADMIN", readAt: null },
  });
}

/** Count unread TUTOR messages for a given tutor (admin-side badge). */
export async function countUnreadForAdmin(tutorId: string): Promise<number> {
  return prisma.eduVerificationMessage.count({
    where: { tutorId, senderRole: "TUTOR", readAt: null },
  });
}
