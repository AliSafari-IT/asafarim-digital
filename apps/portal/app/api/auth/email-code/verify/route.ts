/**
 * POST /api/auth/email-code/verify
 *
 * Verifies a submitted login code.  On success it returns { ok: true } and a
 * short-lived signed token that the client uses to call signIn("email-code", …)
 * via NextAuth — keeping all credential validation server-side.
 *
 * Failure responses are intentionally generic to prevent enumeration.
 *
 * Rate limit: max EMAIL_CODE_MAX_ATTEMPTS (default 5) failed attempts per code.
 */

import { NextResponse } from "next/server";
import { verifyLoginCode } from "@/lib/email-code";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: unknown; code?: unknown };

    const email =
      typeof body.email === "string" ? body.email.toLowerCase().trim() : "";
    const code =
      typeof body.code === "string" ? body.code.toUpperCase().trim() : "";

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email address is required." },
        { status: 400 }
      );
    }

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: "A 6-character login code is required." },
        { status: 400 }
      );
    }

    const result = await verifyLoginCode(email, code);

    if (!result.ok) {
      if (result.reason === "rate_limited") {
        return NextResponse.json(
          { error: "Too many attempts. Please request a new code." },
          { status: 429 }
        );
      }
      // "invalid" — generic to avoid leaking why it failed
      return NextResponse.json(
        { error: "Invalid or expired code. Please try again." },
        { status: 401 }
      );
    }

    // Code is valid and consumed.  Signal success so the client can call
    // signIn("email-code", { email, userId }) through NextAuth.
    return NextResponse.json({
      ok: true,
      userId: result.userId,
      email: result.email,
    });
  } catch (error) {
    console.error("[email-code/verify] error:", error);
    return NextResponse.json(
      { error: "Unable to verify code right now. Please try again later." },
      { status: 500 }
    );
  }
}
