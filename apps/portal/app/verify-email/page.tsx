import crypto from "node:crypto";
import Link from "next/link";
import { prisma } from "@asafarim/db";
import { SiteFooter, SiteHeader } from "@/components/site-shell";

export const dynamic = "force-dynamic";

type Status = "success" | "expired" | "invalid" | "missing" | "error";

async function consumeToken(rawToken: string | undefined): Promise<Status> {
  if (!rawToken) return "missing";

  try {
    const hashed = crypto.createHash("sha256").update(rawToken).digest("hex");
    const record = await prisma.verificationToken.findFirst({
      where: {
        token: hashed,
        identifier: { startsWith: "email-verification:" },
      },
    });

    if (!record) return "invalid";

    // Always consume the token (single-use) even if expired
    await prisma.verificationToken.deleteMany({
      where: { identifier: record.identifier, token: record.token },
    });

    if (record.expires < new Date()) return "expired";

    const email = record.identifier.replace(/^email-verification:/, "");
    await prisma.user.update({
      where: { email },
      data: { emailVerified: new Date() },
    });

    return "success";
  } catch (error) {
    console.error("verify-email failed", error);
    return "error";
  }
}

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const params = await searchParams;
  const status = await consumeToken(params.token);

  const messages: Record<Status, { title: string; body: string; tone: "ok" | "warn" | "err" }> = {
    success: {
      title: "Email verified",
      body: "Your email address has been verified. You can now edit your profile and use all features.",
      tone: "ok",
    },
    expired: {
      title: "This verification link has expired",
      body: "Go back to your profile and request a new verification email.",
      tone: "warn",
    },
    invalid: {
      title: "Invalid verification link",
      body: "This link is not valid. It may have already been used. Request a new one from your profile.",
      tone: "warn",
    },
    missing: {
      title: "Missing verification token",
      body: "No token was provided. Open the verification email and click the link again.",
      tone: "warn",
    },
    error: {
      title: "Something went wrong",
      body: "We could not verify your email. Please try again in a moment.",
      tone: "err",
    },
  };

  const message = messages[status];
  const toneClass =
    message.tone === "ok"
      ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-200"
      : message.tone === "warn"
        ? "border-amber-400/30 bg-amber-400/10 text-amber-200"
        : "border-rose-400/30 bg-rose-400/10 text-rose-200";

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[var(--color-surface)] text-[var(--color-text)]">
      <div aria-hidden="true" className="site-noise" />
      <SiteHeader />
      <main className="mx-auto w-full max-w-3xl px-6 pb-20 pt-16">
        <div className={`rounded-[2rem] border p-8 ${toneClass}`}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] opacity-80">
            Email Verification
          </p>
          <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">{message.title}</h1>
          <p className="mt-4 text-sm leading-7 opacity-90">{message.body}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/profile"
              className="rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)]"
            >
              Go to profile
            </Link>
            <Link
              href="/"
              className="rounded-full border border-[var(--color-border-strong)] px-5 py-2.5 text-sm font-semibold transition hover:border-[var(--color-primary)]"
            >
              Back to home
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
