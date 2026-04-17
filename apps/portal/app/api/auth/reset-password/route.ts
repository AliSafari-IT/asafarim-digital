import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { hashPassword } from "@asafarim/auth";

function hashResetToken(rawToken: string): string {
  return crypto.createHash("sha256").update(rawToken).digest("hex");
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { token?: string; password?: string };
    const rawToken = body.token?.trim();
    const password = body.password ?? "";

    if (!rawToken) {
      return NextResponse.json({ ok: false, error: "Reset token is required." });
    }

    if (password.length < 8) {
      return NextResponse.json({ ok: false, error: "Password must be at least 8 characters." });
    }

    const hashedToken = hashResetToken(rawToken);
    const now = new Date();

    const resetToken = await prisma.verificationToken.findFirst({
      where: {
        token: hashedToken,
        identifier: { startsWith: "password-reset:" },
        expires: { gt: now },
      },
      select: {
        identifier: true,
        token: true,
      },
    });

    if (!resetToken) {
      return NextResponse.json({ ok: false, error: "This reset link is invalid or has expired." });
    }

    const email = resetToken.identifier.replace(/^password-reset:/, "").toLowerCase();
    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (!user) {
      await prisma.verificationToken.deleteMany({
        where: {
          identifier: resetToken.identifier,
        },
      });
      return NextResponse.json({ ok: false, error: "This reset link is invalid or has expired." });
    }

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.verificationToken.deleteMany({
        where: {
          identifier: resetToken.identifier,
        },
      }),
      prisma.session.deleteMany({
        where: { userId: user.id },
      }),
    ]);

    return NextResponse.json({ ok: true, message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Reset password failed", error);
    return NextResponse.json(
      { ok: false, error: "Unable to reset password right now." },
      { status: 500 },
    );
  }
}
