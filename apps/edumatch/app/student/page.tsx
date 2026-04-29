"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

type Inquiry = {
  id: string;
  subject: string;
  gradeLevel: string;
  description: string;
  status: string;
  createdAt: string;
};

export default function StudentDashboard() {
  const { data: session, status } = useSession();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      fetch("/api/inquiries")
        .then((r) => r.json())
        .then((data) => {
          setInquiries(data.items ?? []);
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-[var(--color-text)]">My Inquiries</h2>
          <Link
            href="/student/inquiry/new"
            className="rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition"
          >
            Ask a Question
          </Link>
        </div>

        {inquiries.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-8 text-center">
            <p className="mb-4 text-[var(--color-text-muted)]">No inquiries yet</p>
            <Link
              href="/student/inquiry/new"
              className="text-[var(--color-primary)] hover:underline"
            >
              Ask your first question
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {inquiries.map((inquiry) => (
              <Link
                key={inquiry.id}
                href={`/student/inquiry/${inquiry.id}`}
                className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 transition hover:border-[var(--color-primary)] hover:shadow-lg"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--color-text)] group-hover:text-[var(--color-primary)]">
                      {inquiry.subject}
                    </h3>
                    <p className="text-sm text-[var(--color-text-muted)]">{inquiry.gradeLevel}</p>
                  </div>
                  <StatusBadge status={inquiry.status} />
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-[var(--color-text-muted)]">
                  {inquiry.description}
                </p>
                <p className="mt-4 text-xs text-[var(--color-text-muted)]">
                  {new Date(inquiry.createdAt).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    NEW: "bg-gray-100 text-gray-700",
    AI_RESPONDED: "bg-blue-100 text-blue-700",
    TUTOR_REQUESTED: "bg-yellow-100 text-yellow-700",
    BOOKED: "bg-green-100 text-green-700",
    CLOSED: "bg-gray-100 text-gray-500",
  };

  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${styles[status] || styles.NEW}`}>
      {status.replace("_", " ")}
    </span>
  );
}
