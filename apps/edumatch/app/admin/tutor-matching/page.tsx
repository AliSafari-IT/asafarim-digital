"use client";

import { useState } from "react";
import type { ScoredTutor } from "@/lib/types/tutor-matching";

export default function TutorMatchingDebugPage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ScoredTutor[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [params, setParams] = useState({
    lat: 51.5074,
    lng: -0.1278,
    subject: "Math",
    gradeLevel: "K12",
    maxDistanceKm: 50,
    preferOnline: false,
    limit: 20,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      const res = await fetch("/api/admin/tutor-matching/debug", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to fetch");
      }

      const data = await res.json();
      setResults(data.tutors);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">
        Tutor Matching Debug
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
            Search Parameters
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                Latitude
              </label>
              <input
                type="number"
                step="any"
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-sm text-[var(--color-text)]"
                value={params.lat}
                onChange={(e) => setParams({ ...params, lat: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                Longitude
              </label>
              <input
                type="number"
                step="any"
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-sm text-[var(--color-text)]"
                value={params.lng}
                onChange={(e) => setParams({ ...params, lng: parseFloat(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                Subject
              </label>
              <input
                type="text"
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-sm text-[var(--color-text)]"
                value={params.subject}
                onChange={(e) => setParams({ ...params, subject: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                Grade Level
              </label>
              <input
                type="text"
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-sm text-[var(--color-text)]"
                value={params.gradeLevel}
                onChange={(e) => setParams({ ...params, gradeLevel: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                Max Distance (km)
              </label>
              <input
                type="number"
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-sm text-[var(--color-text)]"
                value={params.maxDistanceKm}
                onChange={(e) => setParams({ ...params, maxDistanceKm: parseFloat(e.target.value) })}
              />
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="preferOnline"
                className="mr-2"
                checked={params.preferOnline}
                onChange={(e) => setParams({ ...params, preferOnline: e.target.checked })}
              />
              <label htmlFor="preferOnline" className="text-sm text-[var(--color-text)]">
                Prefer Online-Only Tutors
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-muted)] mb-1">
                Limit
              </label>
              <input
                type="number"
                className="w-full rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-2 text-sm text-[var(--color-text)]"
                value={params.limit}
                onChange={(e) => setParams({ ...params, limit: parseInt(e.target.value) })}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded bg-emerald-600 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
            >
              {loading ? "Searching..." : "Find Tutors"}
            </button>
          </form>
          {error && (
            <p className="mt-4 text-sm text-red-400">{error}</p>
          )}
        </div>

        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
          <h2 className="text-lg font-semibold text-[var(--color-text)] mb-4">
            Results {results && `(${results.length})`}
          </h2>
          {results === null ? (
            <p className="text-sm text-[var(--color-text-muted)]">
              Run a search to see results.
            </p>
          ) : results.length === 0 ? (
            <p className="text-sm text-[var(--color-text-muted)]">
              No tutors found.
            </p>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {results.map((tutor, i) => (
                <div
                  key={tutor.userId}
                  className="rounded border border-[var(--color-border)] bg-[var(--color-surface)] p-3"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-[var(--color-text)]">
                      #{i + 1} {tutor.userId}
                    </span>
                    <span className="text-sm rounded bg-emerald-500/15 px-2 py-1 text-emerald-400">
                      Score: {tutor.compositeScore.toFixed(3)}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-sm text-[var(--color-text)]">
                    <div>
                      <span className="font-medium text-[var(--color-text-muted)]">Distance:</span>{" "}
                      {tutor.distanceKm} km
                    </div>
                    <div>
                      <span className="font-medium text-[var(--color-text-muted)]">Rate:</span>{" "}
                      &euro;{(tutor.hourlyRateCents / 100).toFixed(0)}/hr
                    </div>
                    <div>
                      <span className="font-medium text-[var(--color-text-muted)]">Rating:</span>{" "}
                      {tutor.ratingAvg.toFixed(1)} ({tutor.ratingCount})
                    </div>
                    <div>
                      <span className="font-medium text-[var(--color-text-muted)]">Online Only:</span>{" "}
                      {tutor.onlineOnly ? "Yes" : "No"}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-[var(--color-text-muted)]">Subjects:</span>{" "}
                      {tutor.subjectsTaught.join(", ")}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-[var(--color-text-muted)]">Levels:</span>{" "}
                      {tutor.levelsTaught.join(", ")}
                    </div>
                    <div className="col-span-2">
                      <span className="font-medium text-[var(--color-text-muted)]">Subject Match:</span>{" "}
                      {tutor.subjectMatch ? "✓" : "✗"}
                      <span className="ml-2 font-medium text-[var(--color-text-muted)]">Level Match:</span>{" "}
                      {tutor.levelMatch ? "✓" : "✗"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
