"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function ConnectOnboardPage() {
  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState(false);
  const [status, setStatus] = useState<{
    hasAccount: boolean;
    payoutEnabled: boolean;
    stripeAccountId?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/tutors/connect/onboard")
      .then((r) => r.json())
      .then((data) => {
        setStatus(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load onboarding status.");
        setLoading(false);
      });
  }, []);

  async function startOnboarding() {
    setOnboarding(true);
    setError(null);

    try {
      const res = await fetch("/api/tutors/connect/onboard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await res.json() as { url?: string; error?: string; alreadyOnboarded?: boolean };

      if (!res.ok) {
        setError(data.error ?? "Failed to start onboarding.");
        setOnboarding(false);
        return;
      }

      if (data.alreadyOnboarded) {
        setStatus((s) => (s ? { ...s, hasAccount: true } : null));
        setOnboarding(false);
        return;
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setError("Network error. Please try again.");
      setOnboarding(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="flex h-[40vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-primary)]"></div>
        </div>
      </div>
    );
  }

  const isComplete = status?.hasAccount && status?.payoutEnabled;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link href="/tutor" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
          ← Back to Dashboard
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">Stripe Connect Setup</h1>
      <p className="text-[var(--color-text-muted)] mb-6">
        Connect your bank account to receive payments from students. EduMatch uses Stripe Connect for secure, instant payouts.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
        {/* Step 1: Create Account */}
        <div className="flex items-start gap-4 mb-6">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${status?.hasAccount ? "bg-green-500 text-white" : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)]"}`}>
            {status?.hasAccount ? "✓" : "1"}
          </div>
          <div>
            <h3 className="font-medium text-[var(--color-text)]">Create Stripe Account</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              {status?.hasAccount
                ? "Your Stripe Connect account has been created."
                : "Create your Stripe Connect Express account to receive payments."}
            </p>
          </div>
        </div>

        {/* Step 2: Complete Onboarding */}
        <div className="flex items-start gap-4 mb-6">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${status?.payoutEnabled ? "bg-green-500 text-white" : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)]"}`}>
            {status?.payoutEnabled ? "✓" : "2"}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-[var(--color-text)]">Verify Identity & Bank</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              {status?.payoutEnabled
                ? "Your account is verified and ready to receive payouts."
                : "Complete identity verification and add your bank account to enable payouts."}
            </p>
            {!status?.payoutEnabled && status?.hasAccount && (
              <button
                onClick={startOnboarding}
                disabled={onboarding}
                className="mt-3 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50"
              >
                {onboarding ? "Loading..." : "Complete Verification"}
              </button>
            )}
          </div>
        </div>

        {/* Step 3: Ready */}
        <div className="flex items-start gap-4">
          <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${isComplete ? "bg-green-500 text-white" : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)]"}`}>
            {isComplete ? "✓" : "3"}
          </div>
          <div>
            <h3 className="font-medium text-[var(--color-text)]">Ready to Receive Payments</h3>
            <p className="text-sm text-[var(--color-text-muted)]">
              {isComplete
                ? "You're all set! Students can now book sessions with you."
                : "Complete steps 1 and 2 to start receiving payments."}
            </p>
          </div>
        </div>

        {/* Action Button */}
        {!status?.hasAccount && (
          <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
            <button
              onClick={startOnboarding}
              disabled={onboarding}
              className="w-full rounded-lg bg-[var(--color-primary)] px-6 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition flex items-center justify-center gap-2"
            >
              {onboarding ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Connecting to Stripe...
                </>
              ) : (
                "Connect with Stripe"
              )}
            </button>
            <p className="mt-3 text-xs text-center text-[var(--color-text-muted)]">
              You'll be redirected to Stripe to complete the onboarding process securely.
            </p>
          </div>
        )}

        {isComplete && (
          <div className="mt-8 pt-6 border-t border-[var(--color-border)]">
            <Link
              href="/tutor"
              className="block w-full text-center rounded-lg bg-green-500 px-6 py-3 text-sm font-medium text-white hover:bg-green-600 transition"
            >
              Go to Dashboard
            </Link>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-lg bg-blue-50 border border-blue-200 px-4 py-3 text-sm text-blue-700">
        <strong>Why Stripe Connect?</strong>
        <p className="mt-1">
          Stripe Connect handles all payment processing, identity verification, and bank transfers securely. 
          EduMatch never stores your bank details. Payouts typically arrive in 1-2 business days.
        </p>
      </div>
    </div>
  );
}
