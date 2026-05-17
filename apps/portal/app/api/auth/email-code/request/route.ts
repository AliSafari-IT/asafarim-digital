/**
 * POST /api/auth/email-code/request
 *
 * Sends a one-time login code to the given email address **only** if the email
 * belongs to a registered user. The response is intentionally generic so that
 * callers cannot determine whether the email is registered (anti-enumeration).
 *
 * Rate limit: max EMAIL_CODE_MAX_REQUESTS (default 5) per email per
 *             EMAIL_CODE_REQUEST_WINDOW_MINUTES (default 15) minutes.
 */

import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import {
  isRequestRateLimited,
  createLoginCode,
  getCodeTtlMinutes,
} from "@/lib/email-code";
import { sendEmailLoginCode } from "@/lib/email-login-code-email";

const GENERIC_SUCCESS =
  "If that email is registered, a login code has been sent. Check your inbox.";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: unknown };
    const normalizedEmail =
      typeof body.email === "string" ? body.email.toLowerCase().trim() : "";

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    // ── Rate limit check (uses DB row count — no Redis needed) ──────────────
    const limited = await isRequestRateLimited(normalizedEmail);
    if (limited) {
      return NextResponse.json(
        { error: "Too many code requests. Please wait a few minutes and try again." },
        { status: 429 }
      );
    }

    // ── Look up user — must be registered ───────────────────────────────────
    // We look up the user but intentionally return the same generic response
    // whether or not they exist, to prevent account-existence enumeration.
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, name: true, isActive: true },
    });

    if (!user || !user.isActive) {
      // Return generic success — do NOT reveal whether the email is registered.
      return NextResponse.json({ message: GENERIC_SUCCESS });
    }

    // ── Generate code, persist hash, send email ──────────────────────────────
    const code = await createLoginCode(normalizedEmail);
    const expiresInMinutes = getCodeTtlMinutes();

    await sendEmailLoginCode({
      to: normalizedEmail,
      name: user.name,
      code,
      expiresInMinutes,
    });

    return NextResponse.json({ message: GENERIC_SUCCESS });
  } catch (error) {
    console.error("[email-code/request] error:", error);
    return NextResponse.json(
      { error: "Unable to send login code right now. Please try again later." },
      { status: 500 }
    );
  }
}
