"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useMemo, useState } from "react";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPageContent />
    </Suspense>
  );
}

function ResetPasswordPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token")?.trim() ?? "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!token) {
      setErrorMessage("This reset link is invalid or incomplete.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = (await response.json()) as { error?: string; message?: string };

      if (!response.ok) {
        setErrorMessage(data.error || "Unable to reset password.");
        return;
      }

      setSuccessMessage(data.message || "Password reset successfully.");
      window.setTimeout(() => {
        router.push("/sign-in");
      }, 1200);
    } catch {
      setErrorMessage("Unable to reset password.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-xl rounded-[2rem] border border-[var(--color-border-strong)] bg-[var(--color-panel)] p-6 shadow-[var(--shadow-card)] sm:p-8">
      <p className="inline-flex rounded-full border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
        Set new password
      </p>
      <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em]">Reset your password</h1>
      <p className="mt-3 text-sm leading-7 text-[var(--color-text-muted)]">
        Choose a new password for your ASafariM Digital account.
      </p>

      {!token && (
        <div className="mt-4 rounded-2xl border border-[#6c3040] bg-[#2f131c] px-4 py-3 text-sm text-[#ff9aac]">
          Missing reset token. Please request a new reset link.
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 rounded-2xl border border-[#6c3040] bg-[#2f131c] px-4 py-3 text-sm text-[#ff9aac]">
          {errorMessage}
        </div>
      )}

      {successMessage && (
        <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-600/10 px-4 py-3 text-sm text-emerald-200">
          {successMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-medium">
            New password
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
            Confirm new password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
            placeholder="Repeat your new password"
            className="w-full rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface-soft)] px-4 py-3 text-sm outline-none focus:border-[var(--color-primary)]"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading || !token}
          className="w-full rounded-2xl bg-[var(--color-primary)] px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-[var(--color-primary-dark)] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? "Updating password..." : "Update password"}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
        <Link href="/forgot-password" className="font-semibold text-[var(--color-primary)] hover:underline">
          Request a new reset link
        </Link>
      </p>
    </div>
  );
}
