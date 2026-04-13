"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { Suspense, useEffect, useMemo, useState } from "react";

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

  const callbackUrl = useMemo(
    () => searchParams.get("callbackUrl") || "/",
    [searchParams]
  );
  const error = useMemo(() => searchParams.get("error"), [searchParams]);
  const signUpHref = useMemo(() => {
    const params = new URLSearchParams({ callbackUrl });
    return `/sign-up?${params.toString()}`;
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

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_0%,rgba(58,123,255,0.22),transparent_36%),radial-gradient(circle_at_82%_5%,rgba(79,242,201,0.14),transparent_30%)]"
      />

      <section className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-glass)] p-6 shadow-[var(--shadow-card)] backdrop-blur-md sm:p-8">
        <p className="inline-flex rounded-full border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--color-text-secondary)]">
          Portal Access
        </p>
        <h1 className="mt-4 text-3xl font-bold tracking-tight">Sign in to ASafariM</h1>
        <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
          Continue with Google or use your credentials.
        </p>

        {errorMessage && (
          <div className="mt-4 rounded-lg border border-[#5c2b2e] bg-[#2d1215] px-4 py-2 text-sm text-[#f87171]">
            {errorMessage}
          </div>
        )}

        <button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={isLoading || status === "loading"}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface-elevated)] px-4 py-3 text-sm font-medium transition hover:border-[var(--color-primary)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        <div className="my-6 flex items-center gap-3">
          <div className="h-px flex-1 bg-[var(--color-border)]" />
          <span className="text-[11px] font-medium tracking-[0.12em] text-[var(--color-text-secondary)]">
            OR
          </span>
          <div className="h-px flex-1 bg-[var(--color-border)]" />
        </div>

        <form onSubmit={handleCredentialsSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
            />
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm outline-none transition focus:border-[var(--color-primary)]"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || status === "loading"}
            className="mt-2 w-full rounded-lg bg-[var(--color-primary)] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[var(--color-text-secondary)]">
          Don&apos;t have an account?{" "}
          <Link href={signUpHref} className="font-medium text-[var(--color-primary)] hover:underline">
            Sign up
          </Link>
        </p>
      </section>
    </main>
  );
}
