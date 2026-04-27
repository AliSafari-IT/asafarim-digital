export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 px-6 py-16">
      <header className="space-y-3">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs font-medium uppercase tracking-wider text-[var(--color-text-secondary)]">
          <span
            className="h-1.5 w-1.5 rounded-full"
            style={{ background: "var(--color-accent)" }}
          />
          Phase 0 · Skeleton
        </span>
        <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
          EduMatch
        </h1>
        <p className="text-lg text-[var(--color-text-secondary)]">
          AI-first homework help and a tutor marketplace. The web + API surface
          lives in this monorepo. The mobile app is intentionally out of scope.
        </p>
      </header>

      <section className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
          Health
        </h2>
        <p className="mt-2 text-sm">
          Probe{" "}
          <code className="rounded bg-black/30 px-1.5 py-0.5 text-[var(--color-accent)]">
            GET /api/health
          </code>{" "}
          to confirm the app boots.
        </p>
      </section>

      <section className="grid gap-3 text-sm text-[var(--color-text-secondary)]">
        <p>Next milestones (see <code>docs/edumatch-project-plan.md</code>):</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Phase 1.1 — Prisma schema for users, profiles, inquiries, quotes, bookings.</li>
          <li>Phase 1.2 — Wire <code>@asafarim/auth</code> with STUDENT / TUTOR / ADMIN roles.</li>
          <li>Phase 2.1 — Intake API + presigned uploads.</li>
        </ul>
      </section>
    </main>
  );
}
