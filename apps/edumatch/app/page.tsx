"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function HomePage() {
  const { data: session } = useSession();
  const isStudent = session?.user?.roles?.includes("STUDENT");
  const isTutor = session?.user?.roles?.includes("TUTOR");

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-20 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-emerald-500/10" />
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm font-medium text-green-400">
            <span className="h-2 w-2 animate-pulse rounded-full bg-green-400" />
            Now Live — Get AI Help Instantly
          </div>
          <h1 className="mb-6 text-4xl font-bold tracking-tight text-[var(--color-text)] sm:text-6xl">
            Get Unstuck with{" "}
            <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
              AI + Expert Tutors
            </span>
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-[var(--color-text-muted)]">
            Snap a photo, get an AI explanation in seconds. Need deeper help?
            Get matched with verified tutors and book sessions instantly.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4">
            {isStudent ? (
              <Link
                href="/student/inquiry/new"
                className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-green-500/25 transition hover:opacity-90 hover:shadow-xl"
              >
                Ask a Question
              </Link>
            ) : isTutor ? (
              <Link
                href="/tutor"
                className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-green-500/25 transition hover:opacity-90 hover:shadow-xl"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/api/auth/signin"
                  className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-green-500/25 transition hover:opacity-90 hover:shadow-xl"
                >
                  Get Started as Student
                </Link>
                <Link
                  href="/api/auth/signin"
                  className="rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-8 py-4 text-base font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface)]"
                >
                  Become a Tutor
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-12 text-center text-3xl font-bold text-[var(--color-text)]">
            How EduMatch Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            <StepCard
              number="1"
              title="Ask Your Question"
              description="Upload a photo, voice note, or type your question. Our AI understands context and complexity."
            />
            <StepCard
              number="2"
              title="Get AI Help"
              description="Receive a detailed explanation in seconds. Follow-up questions are free."
            />
            <StepCard
              number="3"
              title="Match with Tutors"
              description="Need more help? Request quotes from verified local tutors. Compare and book instantly."
            />
          </div>
        </div>
      </section>

      {/* For Students */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-green-400">
              For Students
            </span>
            <h2 className="mt-2 text-3xl font-bold text-[var(--color-text)]">
              Homework Help, Reimagined
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <FeatureCard
              icon={<SparklesIcon />}
              title="AI Explanations"
              description="Get step-by-step explanations tailored to your grade level and subject."
            />
            <FeatureCard
              icon={<MediaIcon />}
              title="Any Format"
              description="Upload photos, voice notes, or text. We handle images, audio, and documents."
            />
            <FeatureCard
              icon={<TutorIcon />}
              title="Expert Tutors"
              description="Verified tutors matched to your location and subject needs."
            />
            <FeatureCard
              icon={<SecureIcon />}
              title="Safe Payments"
              description="Secure checkout with Stripe. Pay only when you book a session."
            />
          </div>
        </div>
      </section>

      {/* For Tutors */}
      <section className="border-y border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-emerald-400">
              For Tutors
            </span>
            <h2 className="mt-2 text-3xl font-bold text-[var(--color-text)]">
              Earn Teaching What You Love
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <FeatureCard
              icon={<WalletIcon />}
              title="Set Your Rate"
              description="You control your hourly rate. We add a small platform fee."
            />
            <FeatureCard
              icon={<CalendarIcon />}
              title="Flexible Schedule"
              description="Choose when you're available. Students book slots that work for you."
            />
            <FeatureCard
              icon={<PayoutIcon />}
              title="Fast Payouts"
              description="Get paid to your bank account within 48 hours of session completion."
            />
          </div>
          <div className="mt-12 text-center">
            <Link
              href="/tutor"
              className="inline-flex items-center gap-2 rounded-xl border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-6 py-3 font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface)]"
            >
              Start Tutoring Today
              <ArrowRightIcon />
            </Link>
          </div>
        </div>
      </section>

      {/* Stats / Trust */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-4xl">
          <div className="grid gap-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-panel)] p-8 text-center sm:grid-cols-3">
            <Stat value="10K+" label="Questions Answered" />
            <Stat value="500+" label="Verified Tutors" />
            <Stat value="98%" label="Student Satisfaction" />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="px-4 py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold text-[var(--color-text)]">
            Ready to Get Started?
          </h2>
          <p className="mb-8 text-[var(--color-text-muted)]">
            Join thousands of students getting help and tutors earning income.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/student/inquiry/new"
              className="rounded-xl bg-gradient-to-r from-green-500 to-emerald-600 px-8 py-4 font-semibold text-white shadow-lg shadow-green-500/25 transition hover:opacity-90"
            >
              Ask a Question
            </Link>
            <Link
              href="/tutor"
              className="rounded-xl border border-[var(--color-border-strong)] px-8 py-4 font-semibold text-[var(--color-text)] transition hover:bg-[var(--color-surface)]"
            >
              Become a Tutor
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="relative rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-6">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-lg font-bold text-white">
        {number}
      </div>
      <h3 className="mb-2 text-lg font-semibold text-[var(--color-text)]">{title}</h3>
      <p className="text-sm text-[var(--color-text-muted)]">{description}</p>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-panel)] p-5 transition hover:border-green-500/30">
      <div className="mb-4 text-green-400">{icon}</div>
      <h3 className="mb-1 font-semibold text-[var(--color-text)]">{title}</h3>
      <p className="text-sm text-[var(--color-text-muted)]">{description}</p>
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="text-3xl font-bold text-green-400">{value}</p>
      <p className="text-sm text-[var(--color-text-muted)]">{label}</p>
    </div>
  );
}

// Icons
function SparklesIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

function MediaIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function TutorIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}

function SecureIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  );
}

function WalletIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  );
}

function PayoutIcon() {
  return (
    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

