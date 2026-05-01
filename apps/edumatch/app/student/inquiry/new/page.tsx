"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SUBJECTS_OF_INTEREST = [
  "Mathematics", "Physics", "Chemistry", "Biology", "English",
  "History", "Geography", "Computer Science", "Economics", "Other",
];

const SUBJECTS = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "English",
  "History",
  "Geography",
  "Computer Science",
  "Economics",
  "Art",
  "Music",
  "Languages",
  "Other",
];

const GRADE_LEVELS = [
  { value: "K12", label: "K–12 (School)" },
  { value: "UNDERGRAD", label: "Undergraduate" },
  { value: "GRAD", label: "Graduate / Postgrad" },
] as const;

const STEPS = ["Subject & Level", "Your Question", "Review"] as const;
const MAX_CHARS = 4000;
const MIN_CHARS = 10;

export default function NewInquiry() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [subject, setSubject] = useState("");
  const [gradeLevel, setGradeLevel] = useState<"K12" | "UNDERGRAD" | "GRAD">("K12");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [needsProfile, setNeedsProfile] = useState(false);
  const [profileSubjects, setProfileSubjects] = useState<string[]>([]);
  const [creatingProfile, setCreatingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const gradeLevelLabel = GRADE_LEVELS.find((g) => g.value === gradeLevel)?.label ?? gradeLevel;
  const canProceed0 = subject.length > 0;
  const canProceed1 = description.trim().length >= MIN_CHARS;

  async function submitInquiry() {
    const res = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ subject, gradeLevel, description: description.trim(), attachments: [] }),
    });
    const data = await res.json() as { id?: string; error?: string };
    if (res.status === 403 && data.error?.toLowerCase().includes("student profile")) {
      setNeedsProfile(true);
      setProfileSubjects(subject ? [subject] : []);
      setSubmitting(false);
      return;
    }
    if (!res.ok) {
      setError(data.error ?? "Failed to create inquiry.");
      setSubmitting(false);
      return;
    }
    router.push(`/student/inquiry/${data.id}`);
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError(null);
    try {
      await submitInquiry();
    } catch {
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  }

  async function handleCreateProfile() {
    setCreatingProfile(true);
    setProfileError(null);
    try {
      const res = await fetch("/api/student/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ gradeLevel, subjectsOfInterest: profileSubjects }),
      });
      const data = await res.json() as { error?: string };
      if (!res.ok) {
        setProfileError(data.error ?? "Failed to create profile.");
        setCreatingProfile(false);
        return;
      }
      setNeedsProfile(false);
      setSubmitting(true);
      await submitInquiry();
    } catch {
      setProfileError("Network error. Please try again.");
      setCreatingProfile(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Back */}
      <div className="mb-6">
        <Link href="/student" className="text-sm text-[var(--color-text-muted)] hover:text-[var(--color-primary)]">
          ← Back to Dashboard
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-[var(--color-text)] mb-6">Ask a Question</h1>

      {/* Stepper */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition ${
                i < step
                  ? "bg-green-500 text-white"
                  : i === step
                  ? "bg-[var(--color-primary)] text-white"
                  : "bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text-muted)]"
              }`}
            >
              {i < step ? "✓" : i + 1}
            </div>
            <span
              className={`text-xs font-medium hidden sm:inline ${
                i === step ? "text-[var(--color-text)]" : "text-[var(--color-text-muted)]"
              }`}
            >
              {label}
            </span>
            {i < STEPS.length - 1 && (
              <div className={`h-px w-8 ${i < step ? "bg-green-500" : "bg-[var(--color-border)]"}`} />
            )}
          </div>
        ))}
      </div>

      {error && !needsProfile && (
        <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {needsProfile && (
        <div className="mb-6 rounded-xl border border-[var(--color-primary)] bg-[color:color-mix(in_srgb,var(--color-primary)_8%,var(--color-panel))] p-6">
          <h2 className="text-base font-semibold text-[var(--color-text)] mb-1">One more step — create your student profile</h2>
          <p className="text-sm text-[var(--color-text-muted)] mb-5">
            Your grade level is already set from your question. Optionally pick subjects you care about, then we&apos;ll submit your inquiry automatically.
          </p>

          {profileError && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {profileError}
            </div>
          )}

          <div className="mb-4">
            <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-1">Grade Level</p>
            <p className="text-sm font-medium text-[var(--color-text)]">{gradeLevelLabel}</p>
          </div>

          <div className="mb-5">
            <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide mb-2">Subjects of Interest <span className="normal-case font-normal">(optional)</span></p>
            <div className="flex flex-wrap gap-2">
              {SUBJECTS_OF_INTEREST.map((s) => {
                const active = profileSubjects.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() =>
                      setProfileSubjects((prev) =>
                        active ? prev.filter((x) => x !== s) : [...prev, s],
                      )
                    }
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
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

          <button
            onClick={handleCreateProfile}
            disabled={creatingProfile}
            className="w-full rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
          >
            {creatingProfile ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Creating profile &amp; submitting…
              </>
            ) : "Create Profile &amp; Submit Inquiry"}
          </button>
        </div>
      )}

      <div className={`rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6 ${needsProfile ? "opacity-50 pointer-events-none" : ""}`}>
        {/* Step 0: Subject & Grade */}
        {step === 0 && (
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Subject *</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              >
                <option value="">Select a subject…</option>
                {SUBJECTS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">Grade Level *</label>
              <div className="grid grid-cols-3 gap-3">
                {GRADE_LEVELS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    onClick={() => setGradeLevel(g.value)}
                    className={`rounded-lg border px-3 py-3 text-sm font-medium text-center transition ${
                      gradeLevel === g.value
                        ? "border-[var(--color-primary)] bg-[var(--color-primary)] text-white"
                        : "border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:border-[var(--color-primary)]"
                    }`}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setStep(1)}
                disabled={!canProceed0}
                className="rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Next →
              </button>
            </div>
          </div>
        )}

        {/* Step 1: Description */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-[var(--color-text-muted)]">Subject</p>
                <p className="text-sm font-medium text-[var(--color-text)]">{subject} · {gradeLevelLabel}</p>
              </div>
              <button onClick={() => setStep(0)} className="text-xs text-[var(--color-primary)] hover:underline">
                Change
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
                Describe your question *
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={8}
                maxLength={MAX_CHARS}
                placeholder="Describe the problem or concept you need help with. Be as specific as possible — include formulas, chapter numbers, or any context that helps."
                className="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2.5 text-sm text-[var(--color-text)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none"
              />
              <div className="flex justify-between mt-1">
                <span className={`text-xs ${description.trim().length < MIN_CHARS ? "text-red-400" : "text-[var(--color-text-muted)]"}`}>
                  {description.trim().length < MIN_CHARS
                    ? `${MIN_CHARS - description.trim().length} more characters needed`
                    : "Looks good ✓"}
                </span>
                <span className="text-xs text-[var(--color-text-muted)]">
                  {description.length} / {MAX_CHARS}
                </span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setStep(0)}
                className="rounded-lg border border-[var(--color-border-strong)] px-5 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)] transition"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!canProceed1}
                className="flex-1 rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed transition"
              >
                Review →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-base font-semibold text-[var(--color-text)]">Review your inquiry</h2>

            <div className="rounded-lg bg-[var(--color-surface)] p-4 space-y-3">
              <div>
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Subject</p>
                <p className="text-sm text-[var(--color-text)] mt-0.5">{subject}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Grade Level</p>
                <p className="text-sm text-[var(--color-text)] mt-0.5">{gradeLevelLabel}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-[var(--color-text-muted)] uppercase tracking-wide">Question</p>
                <p className="text-sm text-[var(--color-text)] mt-0.5 whitespace-pre-wrap line-clamp-6">{description}</p>
              </div>
            </div>

            <p className="text-xs text-[var(--color-text-muted)]">
              After submitting, EduMatch AI will automatically generate an explanation. You can then request tutor quotes.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="rounded-lg border border-[var(--color-border-strong)] px-5 py-2.5 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface)] transition"
              >
                ← Edit
              </button>
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex-1 rounded-lg bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Submitting…
                  </>
                ) : "Submit & Get AI Help"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
