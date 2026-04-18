"use client";

import { useEffect, useRef, useState } from "react";
import { useOutsideClick } from "@/lib/use-outside-click";

const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal-qa.asafarim.com";
const opsHubUrl = process.env.NEXT_PUBLIC_OPS_HUB_URL || "https://ops-hub.asafarim.com";
const marketingContentUrl = process.env.NEXT_PUBLIC_MARKETING_CONTENT_URL || "https://marketing-content.asafarim.com";

const pages = [
  { href: "/#generator", label: "Generator", category: "Content" },
  { href: "/#features", label: "Features", category: "Content" },
  { href: "/#prompts", label: "Prompts", category: "Content" },
];

const apps = [
  { href: portalUrl, label: "Portal", category: "Apps" },
  { href: opsHubUrl, label: "Ops Hub", category: "Apps" },
  { href: marketingContentUrl, label: "Marketing Content", category: "Apps" },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, open, () => setOpen(false));

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const filteredPages = pages.filter((p) =>
    p.label.toLowerCase().includes(query.toLowerCase())
  );
  const filteredApps = apps.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
      )}
      <div
        ref={ref}
        className={`fixed left-1/2 top-[20%] z-[60] w-full max-w-lg -translate-x-1/2 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl transition-all ${
          open ? "scale-100 opacity-100" : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <div className="flex items-center border-b border-[var(--color-border)] px-4">
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 text-[var(--color-text-secondary)]" aria-hidden="true">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M14 14l-3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Jump to page or app..."
            className="flex-1 border-none bg-transparent px-3 py-4 text-sm text-[var(--color-text)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:ring-0"
            autoFocus
          />
          <kbd className="rounded bg-[var(--color-surface-elevated)] px-2 py-1 text-xs text-[var(--color-text-secondary)]">ESC</kbd>
        </div>
        <div className="max-h-[400px] overflow-y-auto p-2">
          {filteredPages.length > 0 && (
            <div className="mb-2">
              <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Pages
              </p>
              {filteredPages.map((p) => (
                <a
                  key={p.href}
                  href={p.href}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)]"
                >
                  <span className="truncate">{p.label}</span>
                  <span className="ml-auto text-xs text-[var(--color-text-secondary)]">{p.category}</span>
                </a>
              ))}
            </div>
          )}
          {filteredApps.length > 0 && (
            <div>
              <p className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Apps
              </p>
              {filteredApps.map((a) => (
                <a
                  key={a.href}
                  href={a.href}
                  onClick={() => {
                    setOpen(false);
                    setQuery("");
                  }}
                  className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-[var(--color-text)] hover:bg-[var(--color-surface-elevated)]"
                >
                  <span className="truncate">{a.label}</span>
                  <span className="ml-auto text-xs text-[var(--color-text-secondary)]">{a.category}</span>
                </a>
              ))}
            </div>
          )}
          {query && filteredPages.length === 0 && filteredApps.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-[var(--color-text-secondary)]">
              No results found
            </p>
          )}
        </div>
      </div>
    </>
  );
}
