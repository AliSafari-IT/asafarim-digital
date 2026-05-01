"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const SUBJECTS_LIST = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English",
  "History", "Geography", "Computer Science", "Economics", "Art",
  "Music", "Languages", "Other",
];

const GRADE_LEVELS = [
  { value: "K12", label: "K–12 (School)" },
  { value: "UNDERGRAD", label: "Undergraduate" },
  { value: "GRAD", label: "Graduate / Postgrad" },
] as const;

type Profile = {
  bio?: string;
  subjectsTaught: string[];
  levelsTaught: ("K12" | "UNDERGRAD" | "GRAD")[];
  hourlyRateCents: number;
  onlineOnly: boolean;
  serviceRadiusKm: number;
  homeAddress?: {
    line1?: string;
    city?: string;
    region?: string;
    postalCode?: string;
    country?: string;
  };
};

export default function TutorProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exists, setExists] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [bio, setBio] = useState("");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [levels, setLevels] = useState<("K12" | "UNDERGRAD" | "GRAD")[]>([]);
  const [hourlyRate, setHourlyRate] = useState(25);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [serviceRadius, setServiceRadius] = useState(10);
  const [address, setAddress] = useState({
    line1: "",
    city: "",
    region: "",
    postalCode: "",
    country: "",
  });

  useEffect(() => {
    fetch("/api/tutor/profile")
      .then(async (r) => {
        if (r.ok) {
          const data: Profile = await r.json();
          setExists(true);
          setBio(data.bio ?? "");
          setSubjects(data.subjectsTaught ?? []);
          setLevels(data.levelsTaught ?? []);
          setHourlyRate(Math.round(data.hourlyRateCents / 100));
          setOnlineOnly(data.onlineOnly ?? false);
          setServiceRadius(data.serviceRadiusKm ?? 10);
          if (data.homeAddress) {
            setAddress({
              line1: data.homeAddress.line1 ?? "",
              city: data.homeAddress.city ?? "",
              region: data.homeAddress.region ?? "",
              postalCode: data.homeAddress.postalCode ?? "",
              country: data.homeAddress.country ?? "",
            });
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    const payload = {
      bio: bio || undefined,
      subjectsTaught: subjects,
      levelsTaught: levels,
      hourlyRateCents: hourlyRate * 100,
      onlineOnly,
      serviceRadiusKm: onlineOnly ? 0 : serviceRadius,
      homeAddress: address.line1 || address.city ? address : undefined,
    };

    try {
      const res = await fetch("/api/tutor/profile", {
        method: exists ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json() as { error?: string };

      if (!res.ok) {
        setError(data.error ?? "Failed to save profile.");
        setSaving(false);
        return;
      }

      setSuccess(true);
      setExists(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSaving(false);
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

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link href="/tutor" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
          ← Back to Dashboard
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-2">
        {exists ? "Edit Tutor Profile" : "Create Tutor Profile"}
      </h1>
      <p className="text-[var(--color-text-muted)] mb-6">
        {exists
          ? "Update your tutoring details and availability."
          : "Set up your tutor profile to start receiving quote requests from students."}
      </p>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
          Profile saved successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Bio */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            Bio
          </label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            placeholder="Tell students about your teaching experience, qualifications, and approach..."
            className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
          />
          <p className="mt-1 text-xs text-[var(--color-text-muted)]">
            {bio.length}/2000 characters
          </p>
        </div>

        {/* Subjects Taught */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            Subjects You Teach *
          </label>
          <div className="flex flex-wrap gap-2">
            {SUBJECTS_LIST.map((s) => {
              const active = subjects.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() =>
                    setSubjects((prev) =>
                      active ? prev.filter((x) => x !== s) : [...prev, s]
                    )
                  }
                  className={`rounded-full border px-3 py-1.5 text-sm font-medium transition ${
                    active
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                      : "border-[var(--color-border)] text-[var(--color-text-muted)] hover:border-[var(--color-primary)]"
                  }`}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        {/* Levels Taught */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            Grade Levels You Teach *
          </label>
          <div className="grid grid-cols-3 gap-3">
            {GRADE_LEVELS.map((g) => {
              const active = levels.includes(g.value);
              return (
                <button
                  key={g.value}
                  type="button"
                  onClick={() =>
                    setLevels((prev) =>
                      active ? prev.filter((x) => x !== g.value) : [...prev, g.value]
                    )
                  }
                  className={`rounded-lg border px-3 py-3 text-sm font-medium text-center transition ${
                    active
                      ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                      : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-primary)]"
                  }`}
                >
                  {g.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Hourly Rate */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
            Hourly Rate (€) *
          </label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="10"
              max="200"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              className="flex-1"
            />
            <div className="w-20">
              <input
                type="number"
                min="10"
                max="200"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(Number(e.target.value))}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm text-[var(--color-text)] text-center focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
          </div>
        </div>

        {/* Online/In-person */}
        <div className="flex items-center gap-3 p-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          <input
            type="checkbox"
            id="onlineOnly"
            checked={onlineOnly}
            onChange={(e) => setOnlineOnly(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
          />
          <label htmlFor="onlineOnly" className="text-sm text-[var(--color-text)]">
            Online only (no in-person tutoring)
          </label>
        </div>

        {/* Service Radius (only if not online-only) */}
        {!onlineOnly && (
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
              Service Radius (km)
            </label>
            <div className="flex items-center gap-4">
              <input
                type="range"
                min="1"
                max="100"
                value={serviceRadius}
                onChange={(e) => setServiceRadius(Number(e.target.value))}
                className="flex-1"
              />
              <span className="w-12 text-sm text-[var(--color-text)] text-right">{serviceRadius}km</span>
            </div>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">
              How far you&apos;re willing to travel for in-person sessions
            </p>
          </div>
        )}

        {/* Address */}
        <div className="border-t border-[var(--color-border)] pt-6">
          <h3 className="text-sm font-medium text-[var(--color-text)] mb-4">
            {onlineOnly ? "Location (Optional)" : "Base Location *"}
          </h3>
          <div className="space-y-3">
            <input
              type="text"
              placeholder="Street address"
              value={address.line1}
              onChange={(e) => setAddress({ ...address, line1: e.target.value })}
              className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="City"
                value={address.city}
                onChange={(e) => setAddress({ ...address, city: e.target.value })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <input
                type="text"
                placeholder="Region / State"
                value={address.region}
                onChange={(e) => setAddress({ ...address, region: e.target.value })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                placeholder="Postal Code"
                value={address.postalCode}
                onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
              <input
                type="text"
                placeholder="Country"
                value={address.country}
                onChange={(e) => setAddress({ ...address, country: e.target.value })}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <Link
            href="/tutor"
            className="rounded-lg border border-[var(--color-border-strong)] px-5 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)] transition"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || subjects.length === 0 || levels.length === 0}
            className="flex-1 rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Saving…
              </>
            ) : exists ? "Save Changes" : "Create Profile"}
          </button>
        </div>
      </form>
    </div>
  );
}
