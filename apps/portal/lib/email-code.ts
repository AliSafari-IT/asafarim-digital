/**
 * Email one-time login code utilities.
 *
 * Security properties:
 *  - Codes are 6 characters: uppercase A-Z and digits 0-9.
 *  - Each code has 1–5 letters and 1–5 digits (at most 5 of either).
 *  - Codes are stored as SHA-256 hashes — the plaintext is never persisted.
 *  - Codes are single-use and expire after EMAIL_LOGIN_CODE_TTL_MINUTES (default 10 min).
 *  - Rate limiting:
 *      Request : max EMAIL_CODE_MAX_REQUESTS (default 5) per email per
 *                EMAIL_CODE_REQUEST_WINDOW_MINUTES (default 15) window.
 *      Verify  : max EMAIL_CODE_MAX_ATTEMPTS (default 5) failed verifications
 *                per code before it is permanently invalidated.
 */

import crypto from "node:crypto";
import { prisma } from "@asafarim/db";

// ─── Config ────────────────────────────────────────────────────────────────────

/** How long a code is valid (minutes). Env: EMAIL_LOGIN_CODE_TTL_MINUTES */
export function getCodeTtlMinutes(): number {
  const raw = Number(process.env.EMAIL_LOGIN_CODE_TTL_MINUTES ?? "10");
  if (!Number.isFinite(raw) || raw <= 0) return 10;
  return Math.floor(raw);
}

/** Max code-request attempts per email per window. Env: EMAIL_CODE_MAX_REQUESTS */
function getMaxRequests(): number {
  const raw = Number(process.env.EMAIL_CODE_MAX_REQUESTS ?? "5");
  if (!Number.isFinite(raw) || raw <= 0) return 5;
  return Math.floor(raw);
}

/** Sliding window for request rate limit (minutes). Env: EMAIL_CODE_REQUEST_WINDOW_MINUTES */
function getRequestWindowMinutes(): number {
  const raw = Number(process.env.EMAIL_CODE_REQUEST_WINDOW_MINUTES ?? "15");
  if (!Number.isFinite(raw) || raw <= 0) return 15;
  return Math.floor(raw);
}

/** Max failed verification attempts per code before it is locked. Env: EMAIL_CODE_MAX_ATTEMPTS */
export function getMaxVerifyAttempts(): number {
  const raw = Number(process.env.EMAIL_CODE_MAX_ATTEMPTS ?? "5");
  if (!Number.isFinite(raw) || raw <= 0) return 5;
  return Math.floor(raw);
}

// ─── Code generation ───────────────────────────────────────────────────────────

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIGITS = "0123456789";

/**
 * Generate a cryptographically random 6-character login code.
 * Guarantees: exactly 6 chars, A-Z + 0-9, at most 5 letters, at most 5 digits
 * (i.e. always at least 1 letter and at least 1 digit).
 */
export function generateCode(): string {
  // letterCount ∈ [1, 5] so digitCount = 6 - letterCount ∈ [1, 5]
  const letterCount = 1 + (crypto.randomInt(5)); // 1..5 inclusive
  const digitCount = 6 - letterCount;

  const chars: string[] = [];
  for (let i = 0; i < letterCount; i++) {
    chars.push(LETTERS[crypto.randomInt(LETTERS.length)]);
  }
  for (let i = 0; i < digitCount; i++) {
    chars.push(DIGITS[crypto.randomInt(DIGITS.length)]);
  }

  // Fisher-Yates shuffle using crypto.randomInt for unbiased permutation
  for (let i = chars.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [chars[i], chars[j]] = [chars[j]!, chars[i]!];
  }

  return chars.join("");
}

/**
 * Hash a code (uppercased) for safe storage.
 */
export function hashCode(code: string): string {
  return crypto.createHash("sha256").update(code.toUpperCase()).digest("hex");
}

// ─── Rate limiting ──────────────────────────────────────────────────────────────

/**
 * Returns true when the email has hit the request rate limit.
 * Counts EmailLoginCode rows created in the sliding window.
 */
export async function isRequestRateLimited(email: string): Promise<boolean> {
  const windowStart = new Date(
    Date.now() - getRequestWindowMinutes() * 60 * 1000
  );
  const count = await prisma.emailLoginCode.count({
    where: {
      email,
      createdAt: { gte: windowStart },
    },
  });
  return count >= getMaxRequests();
}

// ─── Code lifecycle ─────────────────────────────────────────────────────────────

/**
 * Create a new login code for the given email address.
 * Invalidates any existing unused codes for that email first
 * (by marking them expired) so there is only ever one active code.
 *
 * Returns the plaintext code (send to user via email, do NOT store it).
 */
export async function createLoginCode(email: string): Promise<string> {
  const code = generateCode();
  const codeHash = hashCode(code);
  const expiresAt = new Date(Date.now() + getCodeTtlMinutes() * 60 * 1000);
  const now = new Date();

  await prisma.$transaction([
    // Invalidate any existing active codes for this email
    prisma.emailLoginCode.updateMany({
      where: {
        email,
        usedAt: null,
        expiresAt: { gt: now },
      },
      data: { expiresAt: now }, // expire them immediately
    }),
    // Create the new code
    prisma.emailLoginCode.create({
      data: { email, codeHash, expiresAt },
    }),
  ]);

  return code;
}

// ─── Verification result type ───────────────────────────────────────────────────

export type VerifyResult =
  | { ok: true; userId: string; email: string }
  | { ok: false; reason: "invalid" | "rate_limited" };

/**
 * Verify a submitted code and, if valid, mark it as used and return the
 * authenticated user's ID.
 *
 * This function is the authoritative gate — it increments the attempts counter,
 * locks out codes that exceed max attempts, and marks valid codes as consumed.
 *
 * IMPORTANT: Always returns a generic error for both "wrong code" and "no active
 * code found" to avoid leaking account-existence information.
 */
export async function verifyLoginCode(
  email: string,
  submittedCode: string
): Promise<VerifyResult> {
  const normalizedEmail = email.toLowerCase().trim();
  const submittedHash = hashCode(submittedCode);
  const now = new Date();

  // Find the most recent active (unused, unexpired) code for this email
  const record = await prisma.emailLoginCode.findFirst({
    where: {
      email: normalizedEmail,
      usedAt: null,
      expiresAt: { gt: now },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) {
    // No active code — return generic failure (don't reveal why)
    return { ok: false, reason: "invalid" };
  }

  // Check per-code attempt limit BEFORE comparing (prevents brute-force)
  if (record.attempts >= getMaxVerifyAttempts()) {
    return { ok: false, reason: "rate_limited" };
  }

  // Constant-time comparison is not strictly necessary for hashes, but we
  // still use timingSafeEqual to avoid any theoretical timing side-channel.
  const storedBuf = Buffer.from(record.codeHash, "hex");
  const submittedBuf = Buffer.from(submittedHash, "hex");
  const codesMatch =
    storedBuf.length === submittedBuf.length &&
    crypto.timingSafeEqual(storedBuf, submittedBuf);

  if (!codesMatch) {
    // Increment the attempts counter so brute-force is bounded
    await prisma.emailLoginCode.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return { ok: false, reason: "invalid" };
  }

  // Code is correct — look up the user BEFORE consuming the code
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, email: true, isActive: true },
  });

  if (!user || !user.isActive) {
    // Consume the code anyway to prevent reuse, but don't sign in
    await prisma.emailLoginCode.update({
      where: { id: record.id },
      data: { usedAt: now },
    });
    return { ok: false, reason: "invalid" };
  }

  // Mark code as used (consumed — single-use enforced here)
  await prisma.emailLoginCode.update({
    where: { id: record.id },
    data: { usedAt: now },
  });

  return { ok: true, userId: user.id, email: user.email };
}
