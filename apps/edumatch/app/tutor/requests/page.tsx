"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type QuoteRequest = {
  id: string;
  inquiryId: string;
  subject: string;
  gradeLevel: string;
  description: string;
  requestedAt: string;
  expiresAt: string;
  distanceKm: number;
};

type SlotDraft = { start: string; end: string; mode: "ONLINE" | "IN_PERSON" };

type QuoteForm = {
  hourlyRateCents: number;
  estimatedHours: number;
  notes: string;
  slots: SlotDraft[];
};

const DEFAULT_FORM: QuoteForm = {
  hourlyRateCents: 3000,
  estimatedHours: 2,
  notes: "",
  slots: [{ start: "", end: "", mode: "ONLINE" }],
};

export default function TutorRequestsPage() {
  const [requests, setRequests] = useState<QuoteRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<Set<string>>(new Set());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [forms, setForms] = useState<Record<string, QuoteForm>>({});

  useEffect(() => {
    async function loadRequests(lat?: number, lng?: number) {
      const url = lat != null && lng != null
        ? `/api/tutors/quote-requests?lat=${lat}&lng=${lng}`
        : `/api/tutors/quote-requests`;

      const r = await fetch(url);
      const data = await r.json() as { items?: QuoteRequest[]; error?: string };

      if (data.error) {
        // If no location in profile, try browser geolocation
        if (data.error.includes("lat/lng") && lat == null) {
          if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
              (pos) => loadRequests(pos.coords.latitude, pos.coords.longitude),
              () => {
                setError("Add your home address in your tutor profile to see nearby quote requests.");
                setLoading(false);
              },
            );
          } else {
            setError("Add your home address in your tutor profile to see nearby quote requests.");
            setLoading(false);
          }
          return;
        }
        throw new Error(data.error);
      }

      setRequests(data.items ?? []);
      setLoading(false);
    }

    loadRequests().catch((e: unknown) => {
      setError(e instanceof Error ? e.message : "Failed to load requests");
      setLoading(false);
    });
  }, []);

  function getForm(id: string): QuoteForm {
    return forms[id] ?? { ...DEFAULT_FORM, slots: [{ start: "", end: "", mode: "ONLINE" }] };
  }

  function setForm(id: string, patch: Partial<QuoteForm>) {
    setForms((prev) => ({ ...prev, [id]: { ...getForm(id), ...patch } }));
  }

  function setSlot(id: string, idx: number, patch: Partial<SlotDraft>) {
    const f = getForm(id);
    const slots = f.slots.map((s, i) => (i === idx ? { ...s, ...patch } : s));
    setForm(id, { slots });
  }

  function addSlot(id: string) {
    const f = getForm(id);
    if (f.slots.length >= 5) return;
    setForm(id, { slots: [...f.slots, { start: "", end: "", mode: "ONLINE" }] });
  }

  function removeSlot(id: string, idx: number) {
    const f = getForm(id);
    setForm(id, { slots: f.slots.filter((_, i) => i !== idx) });
  }

  async function submitQuote(qrId: string) {
    const f = getForm(qrId);
    const slots = f.slots.filter((s) => s.start && s.end);
    if (slots.length === 0) {
      setError("Add at least one availability slot before submitting.");
      return;
    }

    setSubmitting(qrId);
    setError(null);

    try {
      const res = await fetch(`/api/quote-requests/${qrId}/quotes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hourlyRateCents: f.hourlyRateCents,
          estimatedHours: f.estimatedHours,
          notes: f.notes || undefined,
          availabilitySlots: slots,
        }),
      });

      const data = await res.json() as { id?: string; error?: string };

      if (!res.ok) {
        setError(data.error ?? "Failed to submit quote.");
        return;
      }

      setSubmitted((prev) => new Set(prev).add(qrId));
      setExpandedId(null);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(null);
    }
  }

  const openRequests = requests.filter((r) => !submitted.has(r.id));
  const quotedRequests = requests.filter((r) => submitted.has(r.id));

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[var(--color-primary)]" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Header */}
      <div className="mb-6 flex items-center gap-3 text-sm">
        <Link href="/tutor" className="text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
          ← Dashboard
        </Link>
        <span className="text-[var(--color-text-muted)]">/</span>
        <span className="text-[var(--color-text)]">Quote Requests</span>
      </div>

      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-1">Quote Requests</h1>
      <p className="text-sm text-[var(--color-text-muted)] mb-6">
        Students near you looking for help in your subjects.
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          <div className="flex items-start justify-between gap-3">
            <div>
              {error}
              {error.includes("profile") && (
                <Link href="/tutor/profile" className="ml-1 font-semibold underline hover:text-amber-900">
                  Update tutor profile →
                </Link>
              )}
            </div>
            <button onClick={() => setError(null)} className="shrink-0 underline text-xs">dismiss</button>
          </div>
        </div>
      )}

      {/* Open requests */}
      <section className="mb-8">
        <h2 className="text-base font-semibold text-[var(--color-text)] mb-3">
          Open ({openRequests.length})
        </h2>

        {openRequests.length === 0 ? (
          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-8 text-center text-sm text-[var(--color-text-muted)]">
            No open requests matching your subjects right now.
          </div>
        ) : (
          <div className="space-y-4">
            {openRequests.map((req) => {
              const isExpanded = expandedId === req.id;
              const f = getForm(req.id);
              const isSubmitting = submitting === req.id;
              const expiresIn = Math.max(
                0,
                Math.floor((new Date(req.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60)),
              );

              return (
                <div
                  key={req.id}
                  className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] overflow-hidden"
                >
                  {/* Request summary */}
                  <button
                    onClick={() => setExpandedId(isExpanded ? null : req.id)}
                    className="w-full text-left p-5 hover:bg-[var(--color-surface)] transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-[var(--color-text)]">{req.subject}</span>
                          <span className="rounded-full bg-[var(--color-surface)] border border-[var(--color-border)] px-2 py-0.5 text-xs text-[var(--color-text-muted)]">
                            {req.gradeLevel}
                          </span>
                          {req.distanceKm > 0 && (
                            <span className="text-xs text-[var(--color-text-muted)]">
                              ~{req.distanceKm} km
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[var(--color-text-muted)] line-clamp-2">
                          {req.description}
                        </p>
                      </div>
                      <div className="text-right ml-4 shrink-0">
                        <p className="text-xs text-[var(--color-text-muted)]">Expires in</p>
                        <p className={`font-semibold text-sm ${expiresIn < 6 ? "text-red-500" : "text-[var(--color-text)]"}`}>
                          {expiresIn}h
                        </p>
                      </div>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-[var(--color-text-muted)]">
                        Requested {new Date(req.requestedAt).toLocaleDateString()}
                      </span>
                      <span className="text-xs font-medium text-[var(--color-primary)]">
                        {isExpanded ? "▲ Collapse" : "▼ Submit Quote"}
                      </span>
                    </div>
                  </button>

                  {/* Quote form */}
                  {isExpanded && (
                    <div className="border-t border-[var(--color-border)] p-5 bg-[var(--color-surface)]">
                      <h3 className="text-sm font-semibold text-[var(--color-text)] mb-4">Submit Your Quote</h3>

                      {/* Rate + hours */}
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                            Hourly Rate (€)
                          </label>
                          <input
                            type="number"
                            min={1}
                            max={1000}
                            value={f.hourlyRateCents / 100}
                            onChange={(e) =>
                              setForm(req.id, { hourlyRateCents: Math.round(parseFloat(e.target.value) * 100) })
                            }
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                            Estimated Hours
                          </label>
                          <input
                            type="number"
                            min={0.5}
                            max={100}
                            step={0.5}
                            value={f.estimatedHours}
                            onChange={(e) => setForm(req.id, { estimatedHours: parseFloat(e.target.value) })}
                            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                          />
                        </div>
                      </div>

                      {/* Total preview */}
                      <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-2 text-sm">
                        <span className="text-green-600">Total: </span>
                        <span className="font-bold text-green-700">
                          €{((f.hourlyRateCents / 100) * f.estimatedHours).toFixed(2)}
                        </span>
                      </div>

                      {/* Availability slots */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-xs font-medium text-[var(--color-text-muted)]">
                            Availability Slots (min 1)
                          </label>
                          {f.slots.length < 5 && (
                            <button
                              onClick={() => addSlot(req.id)}
                              className="text-xs text-[var(--color-primary)] hover:underline"
                            >
                              + Add slot
                            </button>
                          )}
                        </div>
                        <div className="space-y-2">
                          {f.slots.map((slot, idx) => (
                            <div key={idx} className="grid grid-cols-[1fr_1fr_auto_auto] gap-2 items-center">
                              <input
                                type="datetime-local"
                                value={slot.start}
                                onChange={(e) => setSlot(req.id, idx, { start: e.target.value })}
                                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-2 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                              />
                              <input
                                type="datetime-local"
                                value={slot.end}
                                onChange={(e) => setSlot(req.id, idx, { end: e.target.value })}
                                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-2 py-1.5 text-xs text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                              />
                              <select
                                value={slot.mode}
                                onChange={(e) => setSlot(req.id, idx, { mode: e.target.value as "ONLINE" | "IN_PERSON" })}
                                className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-2 py-1.5 text-xs text-[var(--color-text)] focus:outline-none"
                              >
                                <option value="ONLINE">Online</option>
                                <option value="IN_PERSON">In-Person</option>
                              </select>
                              {f.slots.length > 1 && (
                                <button
                                  onClick={() => removeSlot(req.id, idx)}
                                  className="text-red-400 hover:text-red-600 text-xs px-1"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="mb-4">
                        <label className="block text-xs font-medium text-[var(--color-text-muted)] mb-1">
                          Notes (optional)
                        </label>
                        <textarea
                          rows={2}
                          maxLength={500}
                          value={f.notes}
                          onChange={(e) => setForm(req.id, { notes: e.target.value })}
                          placeholder="Any extra info for the student…"
                          className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] px-3 py-2 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => submitQuote(req.id)}
                          disabled={isSubmitting}
                          className="flex-1 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 transition"
                        >
                          {isSubmitting ? "Submitting…" : "Send Quote"}
                        </button>
                        <button
                          onClick={() => setExpandedId(null)}
                          className="rounded-lg border border-[var(--color-border-strong)] px-4 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)] transition"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Quoted section */}
      {quotedRequests.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-[var(--color-text)] mb-3">
            Quoted ({quotedRequests.length})
          </h2>
          <div className="space-y-3">
            {quotedRequests.map((req) => (
              <div
                key={req.id}
                className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-4 opacity-60"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium text-sm text-[var(--color-text)]">{req.subject}</span>
                    <span className="ml-2 text-xs text-[var(--color-text-muted)]">{req.gradeLevel}</span>
                  </div>
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
                    ✓ Quote Sent
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
