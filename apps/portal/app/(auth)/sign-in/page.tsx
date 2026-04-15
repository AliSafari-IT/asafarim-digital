"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Suspense, useEffect, useMemo, useState } from "react";

const trustPoints = [
  "Access product demos, portals, and internal tools from one account.",
  "Google OAuth and credential auth supported.",
  "Built for secure iteration across SaaS products and experiments.",
];

function normalizeCallbackUrl(raw: string | null): string {
  if (!raw) return "/";
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;

  try {
    const parsed = new URL(raw);
    if (typeof window !== "undefined" && parsed.origin === window.location.origin) {
      return `${parsed.pathname}${parsed.search}${parsed.hash}` || "/";
    }
  } catch {
    // Ignore malformed callback URLs and fall back to root.
  }

  return "/";
}

export default function SignInPage() {
  return (
    <Suspense fallback={null}>
      <SignInPageContent />
    </Suspense>
  );
}

function SignInPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();

  const callbackUrl = useMemo(() => normalizeCallbackUrl(searchParams.get("callbackUrl")), [searchParams]);
  const error = useMemo(() => searchParams.get("error"), [searchParams]);
  const signUpHref = useMemo(() => {
    const params = new URLSearchParams({ callbackUrl });
    return `/sign-up?${params.toString()}`;
  }, [callbackUrl]);
  const forgotPasswordHref = useMemo(() => {
    const params = new URLSearchParams({ callbackUrl });
    return `/forgot-password?${params.toString()}`;
  }, [callbackUrl]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (error === "CredentialsSignin") {
      setErrorMessage("Invalid email or password");
    }
  }, [error]);

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(callbackUrl);
    }
  }, [status, callbackUrl, router]);

  async function handleCredentialsSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setErrorMessage("Invalid email or password");
      } else if (result?.url) {
        window.location.href = result.url;
      } else {
        router.replace(callbackUrl);
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsLoading(true);
    await signIn("google", { callbackUrl, redirect: true });
  }

  return (
      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(520px,560px)]">
        <section className="rounded-[2rem] border border-[var(--color-border-strong)] bg-[var(--color-panel-strong)] p-8 shadow-[var(--shadow-card)] sm:p-10 xl:sticky xl:top-28">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">Portal Access</p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-0.04em] sm:text-[3.5rem] sm:leading-[0.95]">
            Sign in to the product workspace.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-[var(--color-text-muted)]">
            The portal is designed as the operational layer behind ASafariM Digital products, experiments, and client-facing systems.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            {trustPoints.map((item, index) => (
              <div key={item} className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-primary)]">0{index + 1}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full rounded-[2rem] border border-[var(--color-border-strong)] bg-[var(--color-panel)] p-6 shadow-[var(--shadow-card)] backdrop-blur-xl sm:p-8">
          <p className="inline-flex rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            Authentication
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">Continue with your account</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
            Use Google or enter your credentials to access the portal.
          </p>

          {errorMessage && (
            <div className="mt-4 rounded-2xl border border-[#6c3040] bg-[#2f131c] px-4 py-3 text-sm text-[#ff9aac]">
              {errorMessage}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading || status === "loading"}
            className="mt-6 flex w-full items-center justify-center gap-3 rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-4 py-3.5 text-sm font-semibold transition hover:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            Continue with Google
          </button>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-[var(--color-border)]" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">Or</span>
            <div className="h-px flex-1 bg-[var(--color-border)]" />
          </div>

          <form onSubmit={handleCredentialsSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-medium">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="you@example.com"
                className="w-full rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <Link
                  href={forgotPasswordHref}
                  className="text-xs font-semibold text-[var(--color-primary)] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                placeholder="Enter your password"
                className="w-full rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || status === "loading"}
              className="w-full rounded-2xl bg-[var(--color-primary)] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
            Don&apos;t have an account?{" "}
            <Link href={signUpHref} className="font-semibold text-[var(--color-primary)] hover:underline">
              Sign up
            </Link>
          </p>
        </section>
      </div>
  );
}
