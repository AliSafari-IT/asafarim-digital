import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-[100dvh] bg-[var(--color-surface)] text-[var(--color-text)] overflow-hidden">
      {/* Ambient gradient orbs */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-1/3 left-1/4 h-[600px] w-[600px] rounded-full bg-[var(--color-primary)] opacity-[0.07] blur-[120px]" />
        <div className="absolute -bottom-1/4 right-1/4 h-[500px] w-[500px] rounded-full bg-[#c084fc] opacity-[0.07] blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#5de4c7] opacity-[0.04] blur-[80px]" />
      </div>

      {/* Floating back link — top-left on all viewports */}
      <Link
        href="/"
        className="fixed left-4 top-4 z-50 flex items-center gap-1.5 rounded-full border border-[var(--color-border-strong)] bg-[var(--color-panel)] px-3 py-1.5 text-xs font-semibold text-[var(--color-text-muted)] backdrop-blur-xl transition hover:border-[var(--color-primary)] hover:text-[var(--color-primary)] sm:left-6 sm:top-6"
      >
        <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
          <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        ASafariM
      </Link>

      {children}
    </div>
  );
}
