"use client";

import { useTranslation } from "@asafarim/shared-i18n";
import { LOCALES, type Locale, toBaseLanguage } from "@asafarim/shared-i18n";
import { useCallback, useEffect, useState } from "react";

const localeNames: Record<Locale, string> = {
  en: "English",
  "nl-NL": "Nederlands (NL)",
  "nl-BE": "Nederlands (BE)",
  "fr-BE": "Français (BE)",
  "de-BE": "Deutsch (BE)",
  "fr-LU": "Français (LU)",
  "de-LU": "Deutsch (LU)",
};

/** Grouped locale options for the selector */
const localeOptions: { label: string; locales: Locale[] }[] = [
  { label: "English", locales: ["en"] },
  { label: "Nederlands", locales: ["nl-NL", "nl-BE"] },
  { label: "Français", locales: ["fr-BE", "fr-LU"] },
  { label: "Deutsch", locales: ["de-BE", "de-LU"] },
];

export function LanguageSelector() {
  const { locale, setLocale } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle locale changes from other tabs/components
  useEffect(() => {
    const onLocaleChange = (e: CustomEvent<Locale>) => {
      const newLocale = e.detail;
      if (newLocale !== locale) {
        // Force a re-render by updating state if needed
        window.location.reload();
      }
    };
    window.addEventListener("asafarim:locale", onLocaleChange as EventListener);
    return () => {
      window.removeEventListener("asafarim:locale", onLocaleChange as EventListener);
    };
  }, [locale]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const newLocale = e.target.value as Locale;
      setLocale(newLocale);
      // Reload to ensure server components pick up the new locale
      window.location.reload();
    },
    [setLocale]
  );

  if (!mounted) {
    return (
      <div className="h-8 w-24 animate-pulse rounded-lg bg-[var(--color-surface)]" />
    );
  }

  const baseLang = toBaseLanguage(locale);

  return (
    <select
      value={locale}
      onChange={handleChange}
      className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-text)] outline-none transition hover:border-[var(--color-border-strong)] focus:border-[var(--color-primary)]"
      aria-label="Select language"
    >
      {localeOptions.map((group) => (
        <optgroup key={group.label} label={group.label}>
          {group.locales.map((loc) => (
            <option key={loc} value={loc}>
              {localeNames[loc]}
            </option>
          ))}
        </optgroup>
      ))}
    </select>
  );
}
