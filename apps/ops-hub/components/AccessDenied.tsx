import { Lock, ShieldCheck } from "lucide-react";

const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal.asafarim.com";

export function AccessDenied({
  title = "Your account does not have access to Ops Hub",
  message = "You are signed in, but this console is restricted to approved operator roles. Ask an administrator for ops_viewer, ops_admin, or superadmin access.",
}: {
  title?: string;
  message?: string;
}) {
  return (
    <div className="mx-auto flex min-h-[calc(100svh-10rem)] max-w-3xl items-center justify-center px-6 py-16">
      <section className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center shadow-2xl shadow-black/10">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-rose-500/10 text-rose-300">
          <Lock className="h-7 w-7" aria-hidden="true" />
        </div>
        <p className="mt-6 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-subtle)]">
          Restricted operator console
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-normal text-[var(--color-text)]">
          {title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-[var(--color-text-secondary)]">
          {message}
        </p>

        <div className="mt-6 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-soft)] p-4 text-left">
          <div className="flex gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[var(--color-accent)]" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-semibold text-[var(--color-text)]">Accepted roles</h2>
              <p className="mt-1 text-sm leading-6 text-[var(--color-text-secondary)]">
                <span className="font-mono text-[var(--color-accent)]">ops_viewer</span>,{" "}
                <span className="font-mono text-[var(--color-accent)]">ops_admin</span>, or{" "}
                <span className="font-mono text-[var(--color-accent)]">superadmin</span>.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
          <form action="/api/access-requests" method="post">
            <button
              type="submit"
              className="inline-flex h-11 w-full items-center justify-center rounded-md bg-[var(--color-primary)] px-5 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Request Ops access
            </button>
          </form>
          <a
            href={portalUrl}
            className="inline-flex h-11 items-center justify-center rounded-md border border-[var(--color-border-strong)] px-5 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)]"
          >
            Return to Portal
          </a>
          <a
            href="/"
            className="inline-flex h-11 items-center justify-center rounded-md border border-[var(--color-border-strong)] px-5 text-sm font-semibold text-[var(--color-text)] transition hover:border-[var(--color-accent)]"
          >
            View public overview
          </a>
        </div>
      </section>
    </div>
  );
}
