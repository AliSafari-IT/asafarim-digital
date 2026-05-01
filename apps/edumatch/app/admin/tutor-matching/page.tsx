"use client";

import { useState } from "react";
import { findBestTutors, type ScoredTutor } from "@/lib/server/tutor-matching";

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
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin: Tutor Matching Debug</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Form */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Search Parameters</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Latitude</label>
                <input
                  type="number"
                  step="any"
                  className="w-full border rounded p-2"
                  value={params.lat}
                  onChange={(e) => setParams({ ...params, lat: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Longitude</label>
                <input
                  type="number"
                  step="any"
                  className="w-full border rounded p-2"
                  value={params.lng}
                  onChange={(e) => setParams({ ...params, lng: parseFloat(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Subject</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={params.subject}
                  onChange={(e) => setParams({ ...params, subject: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Grade Level</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  value={params.gradeLevel}
                  onChange={(e) => setParams({ ...params, gradeLevel: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Max Distance (km)</label>
                <input
                  type="number"
                  className="w-full border rounded p-2"
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
                <label htmlFor="preferOnline" className="text-sm">Prefer Online-Only Tutors</label>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Limit</label>
                <input
                  type="number"
                  className="w-full border rounded p-2"
                  value={params.limit}
                  onChange={(e) => setParams({ ...params, limit: parseInt(e.target.value) })}
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? "Searching..." : "Find Tutors"}
              </button>
            </form>
            {error && <p className="mt-4 text-red-600">{error}</p>}
          </div>

          {/* Results */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">
              Results {results && `(${results.length})`}
            </h2>
            {results === null ? (
              <p className="text-gray-500">Run a search to see results.</p>
            ) : results.length === 0 ? (
              <p className="text-gray-500">No tutors found.</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {results.map((tutor, i) => (
                  <div key={tutor.userId} className="border rounded p-3 bg-gray-50">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-semibold">#{i + 1} {tutor.userId}</span>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Score: {tutor.compositeScore.toFixed(3)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="font-medium">Distance:</span> {tutor.distanceKm} km
                      </div>
                      <div>
                        <span className="font-medium">Rate:</span> €{(tutor.hourlyRateCents / 100).toFixed(0)}/hr
                      </div>
                      <div>
                        <span className="font-medium">Rating:</span> {tutor.ratingAvg.toFixed(1)} ({tutor.ratingCount})
                      </div>
                      <div>
                        <span className="font-medium">Online Only:</span> {tutor.onlineOnly ? "Yes" : "No"}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Subjects:</span> {tutor.subjectsTaught.join(", ")}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Levels:</span> {tutor.levelsTaught.join(", ")}
                      </div>
                      <div className="col-span-2">
                        <span className="font-medium">Subject Match:</span> {tutor.subjectMatch ? "✓" : "✗"}
                        <span className="ml-2">Level Match:</span> {tutor.levelMatch ? "✓" : "✗"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
