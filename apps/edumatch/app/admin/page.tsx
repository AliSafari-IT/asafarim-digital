import Link from "next/link";

const sections = [
  {
    label: "Tutor Verifications",
    href: "/admin/tutor-verifications",
    description: "Review and approve tutor profiles.",
    icon: "TV",
  },
  {
    label: "Matching Debug",
    href: "/admin/tutor-matching",
    description: "Test the tutor matching algorithm.",
    icon: "MD",
  },
  {
    label: "Disputes",
    href: "/admin/disputes",
    description: "Handle booking disputes.",
    icon: "DS",
    disabled: true,
  },
  {
    label: "Bookings",
    href: "/admin/bookings",
    description: "View and manage bookings.",
    icon: "BK",
    disabled: true,
  },
  {
    label: "Payments & Transactions",
    href: "/admin/payments",
    description: "Track payments and payouts.",
    icon: "PY",
    disabled: true,
  },
  {
    label: "Inquiries",
    href: "/admin/inquiries",
    description: "Browse student inquiries.",
    icon: "IQ",
    disabled: true,
  },
  {
    label: "Users & Tutors",
    href: "/admin/users",
    description: "Manage user accounts and tutor profiles.",
    icon: "UT",
    disabled: true,
  },
  {
    label: "Audit Log",
    href: "/admin/audit",
    description: "Append-only log of sensitive operations.",
    icon: "AU",
    disabled: true,
  },
];

export default function AdminOverviewPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">
          EduMatch Admin
        </h1>
        <p className="mt-1 text-sm text-[var(--color-text-muted)]">
          Manage tutors, verifications, disputes, and platform operations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sections.map((s) => {
          const card = (
            <div
              className={`rounded-lg border p-5 transition ${
                s.disabled
                  ? "border-[var(--color-border)] opacity-50 cursor-not-allowed"
                  : "border-[var(--color-border)] hover:border-emerald-500/40 hover:shadow-md"
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="flex h-8 w-8 items-center justify-center rounded-md bg-emerald-500/15 text-xs font-bold text-emerald-400">
                  {s.icon}
                </span>
                <h2 className="font-semibold text-[var(--color-text)]">
                  {s.label}
                </h2>
              </div>
              <p className="mt-2 text-sm text-[var(--color-text-muted)]">
                {s.description}
              </p>
              {s.disabled && (
                <span className="mt-3 inline-block rounded-full border border-[var(--color-border)] px-2 py-0.5 text-[10px] uppercase tracking-wider text-[var(--color-text-muted)]">
                  Coming soon
                </span>
              )}
            </div>
          );

          if (s.disabled) return <div key={s.href}>{card}</div>;
          return (
            <Link key={s.href} href={s.href} className="block">
              {card}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
