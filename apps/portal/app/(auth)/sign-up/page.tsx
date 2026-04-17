"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Suspense, useEffect, useMemo, useState } from "react";

const accountNotes = [
  "Use one account across the portal and linked product surfaces.",
  "Designed for secure access to demos, automations, and internal tools.",
  "Structured to scale from solo product work to team-facing platforms.",
];

function isTrustedCallbackOrigin(origin: string): boolean {
  if (typeof window !== "undefined" && origin === window.location.origin) {
    return true;
  }
  const allowList = [
    process.env.NEXT_PUBLIC_CONTENT_GENERATOR_URL,
    process.env.NEXT_PUBLIC_PORTAL_URL,
  ]
    .filter((value): value is string => Boolean(value))
    .map((value) => {
      try {
        return new URL(value).origin;
      } catch {
        return null;
      }
    })
    .filter((value): value is string => Boolean(value));

  if (allowList.includes(origin)) return true;

  try {
    const host = new URL(origin).hostname;
    if (host.endsWith(".asafarim.com") || host === "asafarim.com") return true;
    if (host === "localhost" || host === "127.0.0.1") return true;
  } catch {
    // ignore
  }
  return false;
}

function normalizeCallbackUrl(raw: string | null): string {
  if (!raw) return "/";
  if (raw.startsWith("/") && !raw.startsWith("//")) return raw;

  try {
    const parsed = new URL(raw);
    if (isTrustedCallbackOrigin(parsed.origin)) {
      if (typeof window !== "undefined" && parsed.origin === window.location.origin) {
        return `${parsed.pathname}${parsed.search}${parsed.hash}` || "/";
      }
      return parsed.toString();
    }
  } catch {
    // Ignore malformed callback URLs and fall back to root.
  }

  return "/";
}

export default function SignUpPage() {
  return (
    <Suspense fallback={null}>
      <SignUpPageContent />
    </Suspense>
  );
}

function SignUpPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status } = useSession();
  const callbackUrl = useMemo(() => normalizeCallbackUrl(searchParams.get("callbackUrl")), [searchParams]);
  const signInHref = useMemo(() => {
    const params = new URLSearchParams({ callbackUrl });
    return `/sign-in?${params.toString()}`;
  }, [callbackUrl]);

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      if (/^https?:\/\//.test(callbackUrl)) {
        window.location.href = callbackUrl;
      } else {
        router.replace(callbackUrl);
      }
    }
  }, [status, callbackUrl, router]);

  async function handleGoogleSignUp() {
    setIsLoading(true);
    await signIn("google", { callbackUrl, redirect: true });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (!username.trim()) {
      setErrorMessage("Username is required");
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, username, email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrorMessage(data.error || "Registration failed");
        setIsLoading(false);
        return;
      }

      const result = await signIn("credentials", {
        email,
        password,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        router.push(signInHref);
      } else if (result?.url) {
        window.location.href = result.url;
      } else if (/^https?:\/\//.test(callbackUrl)) {
        window.location.href = callbackUrl;
      } else {
        router.replace(callbackUrl);
      }
    } catch {
      setErrorMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(520px,560px)]">
        <section className="rounded-[2rem] border border-[var(--color-border-strong)] bg-[var(--color-panel-strong)] p-8 shadow-[var(--shadow-card)] sm:p-10 xl:sticky xl:top-28">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">Account Setup</p>
          <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-[-0.04em] sm:text-[3.5rem] sm:leading-[0.95]">
            Create an account for the product ecosystem.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-8 text-[var(--color-text-muted)]">
            The sign-up flow now matches the main site language so the experience feels intentional from the first screen.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3 xl:grid-cols-1">
            {accountNotes.map((item, index) => (
              <div key={item} className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--color-primary)]">0{index + 1}</p>
                <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">{item}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="w-full rounded-[2rem] border border-[var(--color-border-strong)] bg-[var(--color-panel)] p-6 shadow-[var(--shadow-card)] backdrop-blur-xl sm:p-8">
          <p className="inline-flex rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
            Registration
          </p>
          <h2 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">Create your portal account</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--color-text-muted)]">
            Register with Google or create credentials for direct sign-in.
          </p>

          {errorMessage && (
            <div className="mt-4 rounded-2xl border border-[#6c3040] bg-[#2f131c] px-4 py-3 text-sm text-[#ff9aac]">
              {errorMessage}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignUp}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium">
                Name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                placeholder="Your name"
                className="w-full rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <label htmlFor="username" className="mb-2 block text-sm font-medium">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                placeholder="your_unique_name"
                className="w-full rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
              />
              <p className="mt-2 text-xs text-[var(--color-text-muted)]">
                This becomes your permanent platform identifier and cannot be changed later.
              </p>
            </div>

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
              <label htmlFor="password" className="mb-2 block text-sm font-medium">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                placeholder="At least 8 characters"
                className="w-full rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-2 block text-sm font-medium">
                Confirm password
              </label>
              <input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                placeholder="Repeat your password"
                className="w-full rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || status === "loading"}
              className="w-full rounded-2xl bg-[var(--color-primary)] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Creating account..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
            Already have an account?{" "}
            <Link href={signInHref} className="font-semibold text-[var(--color-primary)] hover:underline">
              Sign in
            </Link>
          </p>
        </section>
      </div>
  );
}
