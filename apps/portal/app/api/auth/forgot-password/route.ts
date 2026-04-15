import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { sendPasswordResetEmail } from "@/lib/password-reset-email";

const GENERIC_SUCCESS_MESSAGE =
  "If that email exists in our system, a reset link has been sent.";

function getBaseUrl(): string {
  return (
    process.env.PORTAL_URL ||
    process.env.AUTH_URL ||
    process.env.NEXTAUTH_URL ||
    "http://localhost:3000"
  );
}

function getTokenTtlMinutes(): number {
  const raw = Number(process.env.PASSWORD_RESET_TOKEN_TTL_MINUTES ?? "30");
  if (!Number.isFinite(raw) || raw <= 0) return 30;
  return Math.floor(raw);
}

function createResetToken(): { raw: string; hashed: string } {
  const raw = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hashed };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: string };
    const normalizedEmail = body.email?.toLowerCase().trim();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      return NextResponse.json({ error: "A valid email is required." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true, email: true, name: true, password: true },
    });

    // Always return generic success to avoid account enumeration.
    if (!user || !user.password) {
      return NextResponse.json({ message: GENERIC_SUCCESS_MESSAGE });
    }

    const { raw, hashed } = createResetToken();
    const identifier = `password-reset:${normalizedEmail}`;
    const expires = new Date(Date.now() + getTokenTtlMinutes() * 60 * 1000);

    await prisma.$transaction([
      prisma.verificationToken.deleteMany({ where: { identifier } }),
      prisma.verificationToken.create({
        data: {
          identifier,
          token: hashed,
          expires,
        },
      }),
    ]);

    const resetUrl = `${getBaseUrl().replace(/\/$/, "")}/reset-password?token=${encodeURIComponent(raw)}`;
    await sendPasswordResetEmail({
      to: normalizedEmail,
      name: user.name,
      resetUrl,
    });

    return NextResponse.json({ message: GENERIC_SUCCESS_MESSAGE });
  } catch (error) {
    console.error("Forgot password request failed", error);
    return NextResponse.json(
      { error: "Unable to process forgot-password request right now." },
      { status: 500 },
    );
  }
}
