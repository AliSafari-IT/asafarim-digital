"use client";

import Link from "next/link";
import { CommonNavbar, useNavigation } from "@asafarim/ui";
import { CountryLanguageSelector } from "@asafarim/country-language-selector";
import type { AppCode } from "@asafarim/types";

function ViontoLogo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 text-[var(--color-text)]"
      aria-label="Vionto home"
    >
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[var(--color-accent)]/15 text-sm font-semibold text-[var(--color-accent)]">
        Vi
      </span>
      <span className="text-base font-semibold tracking-tight">Vionto</span>
    </Link>
  );
}

function NavActions() {
  return (
    <div className="flex items-center gap-2">
      <CountryLanguageSelector />
    </div>
  );
}

export function ViontoNav() {
  const { items, error } = useNavigation("vionto" as AppCode, "header");

  if (error) {
    console.error("Vionto navigation fetch error:", error);
  }

  return (
    <CommonNavbar
      items={items}
      app="vionto"
      logo={<ViontoLogo />}
      rightContent={<NavActions />}
      sticky
    />
  );
}
