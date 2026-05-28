"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslation } from "@asafarim/shared-i18n";

type Booking = {
  id: string;
  status: string;
  scheduledAt: string | null;
  durationMinutes: number;
  mode: string;
  totalCents: number;
  subject: string;
  gradeLevel: string;
  studentName: string | null;
};

const STATUS_STYLES: Record<string, string> = {
  PENDING:    "bg-amber-100 text-amber-700 border-amber-200",
  CONFIRMED:  "bg-blue-100 text-blue-700 border-blue-200",
  COMPLETED:  "bg-green-100 text-green-700 border-green-200",
  CANCELLED:  "bg-red-100 text-red-600 border-red-200",
  DISPUTED:   "bg-purple-100 text-purple-700 border-purple-200",
};

export default function TutorBookingsPage() {
  const { t } = useTranslation();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/tutors/bookings")
      .then((r) => r.json())
      .then((data: { items?: Booking[]; error?: string }) => {
        if (data.error) throw new Error(data.error);
        setBookings(data.items ?? []);
        setLoading(false);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : t("edumatch.tutor.bookings.loadFailed"));
        setLoading(false);
      });
  }, []);

  const upcoming  = bookings.filter((b) => ["PENDING", "CONFIRMED"].includes(b.status));
  const completed = bookings.filter((b) => b.status === "COMPLETED");
  const other     = bookings.filter((b) => !["PENDING", "CONFIRMED", "COMPLETED"].includes(b.status));

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6 flex items-center gap-3 text-sm">
        <Link href="/tutor" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
          {t("edumatch.inquiry.detail.backToDashboard")}
        </Link>
        <span className="text-[var(--color-text-muted)]">/</span>
        <span className="text-[var(--color-text)]">{t("edumatch.tutor.bookings.breadcrumb")}</span>
      </div>

      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-1">{t("edumatch.tutor.bookings.title")}</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">{t("edumatch.tutor.bookings.subtitle")}</p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">{error}</div>
      )}

      {bookings.length === 0 ? (
        <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-10 text-center">
          <p className="text-[var(--color-text-muted)] text-sm">{t("edumatch.tutor.bookings.empty")}</p>
          <p className="text-xs text-[var(--color-text-muted)] mt-1">{t("edumatch.tutor.bookings.emptyHint")}</p>
        </div>
      ) : (
        <div className="space-y-6">
          {[
            { title: t("edumatch.tutor.bookings.upcoming"), items: upcoming },
            { title: t("edumatch.tutor.bookings.completed"), items: completed },
            { title: t("edumatch.tutor.bookings.other"), items: other },
          ].map(({ title, items }) =>
            items.length === 0 ? null : (
              <section key={title}>
                <h2 className="mb-3 text-sm font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">
                  {title} ({items.length})
                </h2>
                <div className="space-y-3">
                  {items.map((b) => (
                    <div key={b.id} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="font-semibold text-[var(--color-text)]">{b.subject}</span>
                            <span className="rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]">
                              {b.gradeLevel}
                            </span>
                            <span className={`rounded-full border px-2 py-0.5 text-xs font-medium ${STATUS_STYLES[b.status] ?? "bg-gray-100 text-gray-500 border-gray-200"}`}>
                              {b.status}
                            </span>
                            <span className="rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]">
                              {b.mode === "ONLINE" ? "🌐 Online" : "📍 In-Person"}
                            </span>
                          </div>
                          {b.studentName && (
                            <p className="text-sm text-[var(--color-text-muted)]">{t("edumatch.admin.bookings.student")}: {b.studentName}</p>
                          )}
                          {b.scheduledAt && (
                            <p className="text-sm text-[var(--color-text-muted)]">
                              {new Date(b.scheduledAt).toLocaleString()} · {b.durationMinutes} min
                            </p>
                          )}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold text-[var(--color-text)]">
                            €{(b.totalCents / 100).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          )}
        </div>
      )}
    </div>
  );
}
