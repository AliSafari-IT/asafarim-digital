"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsLoading(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setErrorMessage(data.error || "Unable to send reset link right now.");
        return;
      }

      setSuccessMessage(
        data.message || "If that email exists in our system, a reset link has been sent.",
      );
    } catch {
      setErrorMessage("Unable to send reset link right now.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-[var(--color-border-strong)] bg-[var(--color-panel)] p-6 shadow-[var(--shadow-card)] sm:p-8">
      <p className="inline-flex rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
        Password recovery
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">Forgot your password?</h1>
      <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">
        Enter your account email and we&apos;ll send you a secure reset link.
      </p>

      {errorMessage && (
        <div className="mt-4 rounded-2xl border border-[#6c3040] bg-[#2f131c] px-4 py-3 text-sm text-[#ff9aac]">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div
          role="status"
          className="mt-4 rounded-2xl border border-emerald-700 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 shadow-sm"
        >
          <p className="font-semibold text-emerald-900">Reset link sent</p>
          <p className="mt-1 font-medium text-emerald-900">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
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

        <button
          type="submit"
          disabled={isLoading}
          className="w-full rounded-2xl bg-[var(--color-primary)] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Sending reset link..." : "Send reset link"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
        Remembered your password?{" "}
        <Link href="/sign-in" className="font-semibold text-[var(--color-primary)] hover:underline">
          Back to sign in
        </Link>
      </p>
    </div>
  );
}
