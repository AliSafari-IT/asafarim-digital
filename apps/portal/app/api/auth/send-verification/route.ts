import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { auth } from "@asafarim/auth";
import { prisma } from "@asafarim/db";
import { sendVerificationEmail } from "@/lib/verification-email";
import { getPortalBaseUrl } from "@/lib/mailer";

const TOKEN_TTL_MINUTES = 60;

function createToken(): { raw: string; hashed: string } {
  const raw = crypto.randomBytes(32).toString("hex");
  const hashed = crypto.createHash("sha256").update(raw).digest("hex");
  return { raw, hashed };
}

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, email: true, name: true, emailVerified: true },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    if (user.emailVerified) {
      return NextResponse.json({ message: "Email already verified." });
    }

    const { raw, hashed } = createToken();
    const identifier = `email-verification:${user.email.toLowerCase()}`;
    const expires = new Date(Date.now() + TOKEN_TTL_MINUTES * 60 * 1000);

    await prisma.$transaction([
      prisma.verificationToken.deleteMany({ where: { identifier } }),
      prisma.verificationToken.create({
        data: { identifier, token: hashed, expires },
      }),
    ]);

    const verifyUrl = `${getPortalBaseUrl().replace(/\/$/, "")}/verify-email?token=${encodeURIComponent(raw)}`;
    await sendVerificationEmail({ to: user.email, name: user.name, verifyUrl });

    return NextResponse.json({ message: "Verification email sent." });
  } catch (error) {
    console.error("send-verification failed", error);
    return NextResponse.json(
      { error: "Unable to send verification email right now." },
      { status: 500 },
    );
  }
}
