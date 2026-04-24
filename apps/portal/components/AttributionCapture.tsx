"use client";

import { useEffect } from "react";

const ATTR_COOKIE = "asafarim-attr";
const UTM_KEYS = ["utmSource", "utmMedium", "utmCampaign", "utmContent", "utmTerm"] as const;
const QUERY_KEYS: Record<string, (typeof UTM_KEYS)[number]> = {
  utm_source: "utmSource",
  utm_medium: "utmMedium",
  utm_campaign: "utmCampaign",
  utm_content: "utmContent",
  utm_term: "utmTerm",
};

type Attribution = Partial<Record<(typeof UTM_KEYS)[number], string>> & {
  referrer?: string;
  landingPage?: string;
  capturedAt?: string;
};

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeCookie(name: string, value: string, days = 30) {
  if (typeof document === "undefined") return;
  const maxAge = days * 24 * 60 * 60;
  const host = window.location.hostname;
  // Share across asafarim subdomains when on a real domain
  const domain = host.endsWith(".asafarim.com") ? "; domain=.asafarim.com" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax${domain}`;
}

/**
 * Captures UTM / referrer / landing page on first page load and stores them in
 * a cookie shared across asafarim subdomains. The cookie is read server-side at
 * sign-up time and persisted on the User row.
 */
export function AttributionCapture() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const url = new URL(window.location.href);
    const params = url.searchParams;

    // If no UTM params and we already have a capture, do nothing
    const hasUtm = Object.keys(QUERY_KEYS).some((k) => params.has(k));
    const existing = readCookie(ATTR_COOKIE);
    if (!hasUtm && existing) return;

    const captured: Attribution = {};
    for (const [qk, field] of Object.entries(QUERY_KEYS)) {
      const v = params.get(qk);
      if (v) captured[field] = v.slice(0, 200);
    }

    // Only (re)write if we have at least one UTM param or no existing capture
    if (!hasUtm && existing) return;

    if (document.referrer && !document.referrer.startsWith(window.location.origin)) {
      captured.referrer = document.referrer.slice(0, 500);
    }
    captured.landingPage = (window.location.pathname + window.location.search).slice(0, 500);
    captured.capturedAt = new Date().toISOString();

    try {
      writeCookie(ATTR_COOKIE, JSON.stringify(captured));
    } catch {
      // ignore
    }
  }, []);

  return null;
}
