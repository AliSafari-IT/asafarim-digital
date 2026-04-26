import type { Metadata } from "next";
import type { ReactNode } from "react";

export const siteName = "ASafariM Digital";
export const siteDescription =
  "ASafariM Digital builds full-stack SaaS products, AI workflows, and production-grade web platforms for teams that need reliable delivery.";
export const defaultLocale = "en_US";

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_PORTAL_URL ?? process.env.PORTAL_URL ?? "https://portal-qa.asafarim.com";
}

export function absoluteUrl(path = "/") {
  return new URL(path, getSiteUrl()).toString();
}

export function createPageMetadata({
  title,
  description,
  path = "/",
  image = "/opengraph-image",
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    openGraph: {
      type: "website",
      locale: defaultLocale,
      url,
      siteName,
      title,
      description,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: `${siteName} social preview`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
      creator: "@AliSafari_IT",
    },
    robots: noIndex
      ? {
          index: false,
          follow: false,
          googleBot: {
            index: false,
            follow: false,
          },
        }
      : undefined,
  };
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

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: siteName,
    url: getSiteUrl(),
    logo: absoluteUrl("/brand/logo-mark.svg"),
    description: siteDescription,
    sameAs: [
      "https://github.com/AliSafari-IT",
      "https://www.linkedin.com/in/alisafari-it/",
      "https://x.com/AliSafari_IT",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "business inquiries",
      email: "info@asafarim.com",
    },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteName,
    url: getSiteUrl(),
    description: siteDescription,
    publisher: {
      "@type": "Organization",
      name: siteName,
    },
  };
}

export function softwareApplicationSchema({
  name,
  description,
  path,
  category = "BusinessApplication",
}: {
  name: string;
  description: string;
  path: string;
  category?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name,
    description,
    applicationCategory: category,
    operatingSystem: "Web",
    url: absoluteUrl(path),
    publisher: {
      "@type": "Organization",
      name: siteName,
    },
  };
}
