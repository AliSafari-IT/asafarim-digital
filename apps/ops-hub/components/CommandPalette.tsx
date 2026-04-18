"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

export interface CommandItem {
  id: string;
  label: string;
  hint?: string;
  group: string;
  run: () => void;
}

export function CommandPalette({
  nav,
  appsHrefs,
}: {
  nav: Array<{ href: string; label: string }>;
  appsHrefs: {
    portal: string;
    contentGenerator: string;
    opsHub: string;
    marketingContent: string;
  };
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const router = useRouter();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!open) {
      setQuery("");
      setIndex(0);
    }
  }, [open]);

  const items: CommandItem[] = useMemo(
    () => [
      ...nav.map((n) => ({
        id: `nav-${n.href}`,
        label: n.label,
        hint: n.href,
        group: "Navigate",
        run: () => router.push(n.href),
      })),
      {
        id: "app-portal",
        label: "Open Portal",
        hint: "portal-qa.asafarim.com",
        group: "Apps",
        run: () => (window.location.href = appsHrefs.portal),
      },
      {
        id: "app-content",
        label: "Open Content Generator",
        hint: "content-generator-qa.asafarim.com",
        group: "Apps",
        run: () => (window.location.href = appsHrefs.contentGenerator),
      },
      {
        id: "app-ops",
        label: "Open Ops Hub",
        hint: "ops-hub.asafarim.com",
        group: "Apps",
        run: () => (window.location.href = appsHrefs.opsHub),
      },
      {
        id: "app-marketing",
        label: "Open Marketing Content",
        hint: "marketing-content.asafarim.com",
        group: "Apps",
        run: () => (window.location.href = appsHrefs.marketingContent),
      },
    ],
    [nav, appsHrefs, router]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) => i.label.toLowerCase().includes(q) || (i.hint?.toLowerCase().includes(q) ?? false)
    );
  }, [items, query]);

  useEffect(() => {
    if (index >= filtered.length) setIndex(0);
  }, [filtered, index]);

  const grouped = useMemo(() => {
    const map = new Map<string, CommandItem[]>();
    for (const item of filtered) {
      const arr = map.get(item.group) ?? [];
      arr.push(item);
      map.set(item.group, arr);
    }
    return Array.from(map.entries());
  }, [filtered]);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm"
        onClick={() => setOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        className="fixed left-1/2 top-[14vh] z-[70] w-[min(640px,calc(100vw-2rem))] -translate-x-1/2 overflow-hidden rounded-2xl border border-[var(--color-border-strong)] bg-[var(--color-surface)] shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-[var(--color-border)] px-4 py-3">
          <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4 text-[var(--color-text-muted)]" aria-hidden="true">
            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.4" />
            <path d="M14 14l-3-3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setIndex((i) => Math.min(filtered.length - 1, i + 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setIndex((i) => Math.max(0, i - 1));
              } else if (e.key === "Enter") {
                e.preventDefault();
                const chosen = filtered[index];
                if (chosen) {
                  setOpen(false);
                  chosen.run();
                }
              }
            }}
            placeholder="Type to jump to a page or app…"
            className="flex-1 !border-0 !bg-transparent !p-0 text-sm !text-[var(--color-text)] placeholder-[var(--color-text-subtle)] focus:!shadow-none focus:!ring-0"
          />
          <kbd className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] font-mono text-[var(--color-text-subtle)]">
            ESC
          </kbd>
        </div>

        <div className="max-h-[50vh] overflow-y-auto p-2">
          {filtered.length === 0 && (
            <p className="px-3 py-8 text-center text-sm text-[var(--color-text-muted)]">
              No matches for <span className="font-mono text-[var(--color-text)]">{query}</span>
            </p>
          )}
          {grouped.map(([group, gItems]) => (
            <div key={group} className="mb-2 last:mb-0">
              <p className="px-2 pb-1 pt-2 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-text-subtle)]">
                {group}
              </p>
              <ul>
                {gItems.map((item) => {
                  const flatIndex = filtered.indexOf(item);
                  const isActive = flatIndex === index;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onMouseEnter={() => setIndex(flatIndex)}
                        onClick={() => {
                          setOpen(false);
                          item.run();
                        }}
                        className={`flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                          isActive
                            ? "bg-[var(--color-primary-soft)] text-[var(--color-text)]"
                            : "text-[var(--color-text-muted)] hover:bg-white/[0.04] hover:text-[var(--color-text)]"
                        }`}
                      >
                        <span className="truncate">{item.label}</span>
                        {item.hint && (
                          <span className="truncate text-[10px] font-mono text-[var(--color-text-subtle)]">
                            {item.hint}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between border-t border-[var(--color-border)] bg-[var(--color-bg-soft)]/60 px-3 py-2 text-[10px] text-[var(--color-text-subtle)]">
          <span className="flex items-center gap-2">
            <Shortcut k="↑" /><Shortcut k="↓" /> navigate
          </span>
          <span className="flex items-center gap-2">
            <Shortcut k="↵" /> open
          </span>
          <span className="flex items-center gap-2">
            <Shortcut k="⌘" /><Shortcut k="K" /> toggle
          </span>
        </div>
      </div>
    </>
  );
}

function Shortcut({ k }: { k: string }) {
  return (
    <kbd className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-[var(--color-text)]">
      {k}
    </kbd>
  );
}
