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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Please sign in</h1>
          <Link href="/api/auth/signin" className="text-blue-600 hover:underline">
            Sign in
          </Link>
        </div>
      </div>
    );
  }

  const balance = wallet ? (wallet.balanceCents / 100).toFixed(2) : "0.00";
  const pending = wallet ? (wallet.pendingCents / 100).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Tutor Dashboard</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-600">{session?.user?.name}</span>
            <Link
              href="/api/auth/signout"
              className="text-sm text-red-600 hover:underline"
            >
              Sign out
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Available Balance</h3>
            <p className="text-3xl font-bold text-green-600">€{balance}</p>
            {wallet?.nextPayoutEligible && (
              <button className="mt-3 text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full hover:bg-green-200 transition">
                Request Payout
              </button>
            )}
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Pending Earnings</h3>
            <p className="text-3xl font-bold text-yellow-600">€{pending}</p>
            <p className="text-xs text-gray-400 mt-1">Available in 24 hours</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-sm font-medium text-gray-500 mb-1">Quote Requests</h3>
            <p className="text-3xl font-bold text-blue-600">0</p>
            <Link
              href="/tutor/requests"
              className="text-sm text-blue-600 hover:underline mt-1 inline-block"
            >
              View requests →
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
          <div className="flex gap-4">
            <Link
              href="/tutor/connect/onboard"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Setup Stripe Connect
            </Link>
            <Link
              href="/tutor/profile"
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
            >
              Edit Profile
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
