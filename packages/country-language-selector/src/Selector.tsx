"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslation, type Locale } from "@asafarim/shared-i18n";
import {
  BENELUX_COUNTRIES,
  COUNTRY_ORDER,
  LOCALE_LABELS,
  countryForLocale,
  type CountryCode,
} from "./countries";

export type CountryLanguageSelectorProps = {
  lockCountry?: CountryCode;
  onChange?: (next: Locale, country: CountryCode | null) => void;
  className?: string;
  compact?: boolean;
};

export function CountryLanguageSelector({
  lockCountry,
  onChange,
  className,
  compact = false,
}: CountryLanguageSelectorProps) {
  const { locale, setLocale, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState<CountryCode>(() =>
    lockCountry ?? countryForLocale(locale) ?? "NL"
  );
  const rootRef = useRef<HTMLDivElement | null>(null);
  const manualRef = useRef(false);

  /* Sync country only when locale changes *externally* (cookie, another tab).
     Do NOT snap back when the user manually picked a different country. */
  useEffect(() => {
    if (lockCountry) return;
    if (manualRef.current) return;
    const derived = countryForLocale(locale);
    if (derived && derived !== country) setCountry(derived);
  }, [locale, lockCountry]); // eslint-disable-line react-hooks/exhaustive-deps

  /* Close on outside click / Escape */
  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const activeCountry = BENELUX_COUNTRIES[country];
  const languages = activeCountry.languages;
  const activeLabel = LOCALE_LABELS[locale];

  function pickCountry(code: CountryCode) {
    manualRef.current = true;
    setCountry(code);
  }

  function pickLocale(next: Locale) {
    setLocale(next);
    onChange?.(next, country);
    setOpen(false);
  }

  return (
    <div ref={rootRef} className={`relative ${className ?? ""}`}>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="group inline-flex items-center gap-1.5 rounded-lg bg-[var(--color-surface)]/60 px-2.5 py-1.5 text-xs font-medium text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-soft)] hover:text-[var(--color-text)]"
        title={`${t("common.country")} · ${t("common.language")}`}
      >
        <span className="text-base leading-none">{activeCountry.flag}</span>
        {!compact && (
          <span className="hidden font-mono text-[11px] sm:inline">
            {activeLabel.short}
          </span>
        )}
        <svg
          viewBox="0 0 16 16"
          className={`h-3 w-3 text-[var(--color-text-subtle)] transition group-hover:text-[var(--color-text)] ${open ? "rotate-180" : ""}`}
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl shadow-black/20"
        >
          {/* Countries */}
          {!lockCountry && (
            <div className="flex border-b border-[var(--color-border)]">
              {COUNTRY_ORDER.map((code) => {
                const c = BENELUX_COUNTRIES[code];
                const active = code === country;
                return (
                  <button
                    key={code}
                    type="button"
                    onClick={() => pickCountry(code)}
                    className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-xs transition ${
                      active
                        ? "bg-[var(--color-surface-soft)] text-[var(--color-text)]"
                        : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-soft)]/60 hover:text-[var(--color-text)]"
                    }`}
                    aria-pressed={active}
                  >
                    <span className="text-base leading-none">{c.flag}</span>
                    <span className="font-medium">{c.code}</span>
                    {active && (
                      <span className="ml-0.5 h-1 w-1 rounded-full bg-[var(--color-accent)]" />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* Languages */}
          <div className="p-1">
            <ul className="space-y-0.5">
              {languages.map((lng) => {
                const active = lng === locale;
                const label = LOCALE_LABELS[lng];
                return (
                  <li key={lng}>
                    <button
                      type="button"
                      onClick={() => pickLocale(lng)}
                      role="option"
                      aria-selected={active}
                      className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
                        active
                          ? "bg-[var(--color-surface-soft)] text-[var(--color-accent)]"
                          : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface-soft)]/60 hover:text-[var(--color-text)]"
                      }`}
                    >
                      <span className="font-medium">{label.long}</span>
                      {active ? (
                        <svg
                          viewBox="0 0 16 16"
                          className="h-3.5 w-3.5 shrink-0 text-[var(--color-accent)]"
                          fill="none"
                          aria-hidden="true"
                        >
                          <path
                            d="M3 8l3.5 3.5L13 5"
                            stroke="currentColor"
                            strokeWidth="1.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <span className="font-mono text-[10px] text-[var(--color-text-subtle)]">
                          {lng}
                        </span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
