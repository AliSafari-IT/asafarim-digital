import type { ReactNode } from "react";

export const appName = "ASafariM Content Generator";
export const appDescription =
  "Generate high-quality blogs, emails, product copy, social posts, and summaries with an AI content workspace built for SaaS teams.";

export function getAppUrl() {
  return (
    process.env.NEXT_PUBLIC_CONTENT_GENERATOR_URL ??
    process.env.CONTENT_GENERATOR_URL ??
    "https://content-generator-qa.asafarim.com"
  );
}

export function absoluteUrl(path = "/") {
  return new URL(path, getAppUrl()).toString();
}

export function StructuredData({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }): ReactNode {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

export function softwareApplicationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: appName,
    description: appDescription,
    applicationCategory: "ContentApplication",
    operatingSystem: "Web",
    url: getAppUrl(),
    publisher: {
      "@type": "Organization",
      name: "ASafariM Digital",
      url: process.env.NEXT_PUBLIC_PORTAL_URL ?? "https://portal-qa.asafarim.com",
    },
  };
}
