"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

type Wallet = {
  balanceCents: number;
  pendingCents: number;
  nextPayoutEligible: boolean;
};

export default function TutorDashboard() {
  const { data: session, status } = useSession();
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/tutors/wallet")
        .then((r) => r.json())
        .then((data) => {
          setWallet(data.wallet);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-primary)]"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">Please sign in</h1>
          <Link href="/api/auth/signin" className="text-[var(--color-primary)] hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const balance = wallet ? (wallet.balanceCents / 100).toFixed(2) : "0.00";
  const pending = wallet ? (wallet.pendingCents / 100).toFixed(2) : "0.00";

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[var(--color-text)]">Tutor Dashboard</h2>
        <p className="text-[var(--color-text-muted)]">Manage your earnings and quote requests</p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
          <h3 className="mb-1 text-sm font-medium text-[var(--color-text-muted)]">Available Balance</h3>
          <p className="text-3xl font-bold text-green-500">€{balance}</p>
          {wallet?.nextPayoutEligible && (
            <button className="mt-3 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 hover:bg-green-200">
              Request Payout
            </button>
          )}
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
          <h3 className="mb-1 text-sm font-medium text-[var(--color-text-muted)]">Pending Earnings</h3>
          <p className="text-3xl font-bold text-yellow-500">€{pending}</p>
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">Available in 24 hours</p>
        </div>

        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
          <h3 className="mb-1 text-sm font-medium text-[var(--color-text-muted)]">Quote Requests</h3>
          <p className="text-3xl font-bold text-[var(--color-primary)]">0</p>
          <Link
            href="/tutor/requests"
            className="mt-1 inline-block text-sm text-[var(--color-primary)] hover:underline"
          >
            View requests →
          </Link>
        </div>
      </div>

      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-text)]">Quick Actions</h2>
        <div className="flex gap-3">
          <Link
            href="/tutor/connect/onboard"
            className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Setup Stripe Connect
          </Link>
          <Link
            href="/tutor/profile"
            className="rounded-lg border border-[var(--color-border-strong)] px-4 py-2 text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface)]"
          >
            Edit Profile
          </Link>
        </div>
      </div>
    </div>
  );
}
