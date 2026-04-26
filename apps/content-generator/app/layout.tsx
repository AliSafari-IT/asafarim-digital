import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { readThemeFromCookie, themeInitScript } from "../../../packages/ui/src/theme";
import { SessionProvider } from "@/components/SessionProvider";
import { Shell } from "@/components/Shell";
import { I18nProvider } from "@asafarim/shared-i18n";
import { resolveLocaleFromCookie } from "@asafarim/shared-i18n/server";
import { contentGeneratorDictionaries } from "@/lib/i18n-dictionaries";
import { StructuredData, absoluteUrl, appDescription, appName, softwareApplicationSchema } from "@/lib/seo";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: `${appName} | AI Copywriting Workspace`,
    template: `%s | ${appName}`,
  },
  description: appDescription,
  applicationName: appName,
  keywords: ["ASafariM", "AI content generator", "SaaS copywriting", "blog generator", "marketing content"],
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: absoluteUrl("/"),
    siteName: appName,
    title: `${appName} | AI Copywriting Workspace`,
    description: appDescription,
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: `${appName} social preview`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${appName} | AI Copywriting Workspace`,
    description: appDescription,
    images: [absoluteUrl("/twitter-image")],
    creator: "@AliSafari_IT",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default async function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieStore = await cookies();
  const cookieTheme = readThemeFromCookie(cookieStore.toString());
  const initialTheme = cookieTheme ?? "dark";
  const initialLocale = resolveLocaleFromCookie(cookieStore.toString());

  return (
    <html lang={initialLocale} suppressHydrationWarning data-theme={initialTheme}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeInitScript,
          }}
        />
        <StructuredData data={softwareApplicationSchema()} />
      </head>
      <body className="bg-[var(--color-surface)] text-[var(--color-text)] antialiased">
        <I18nProvider initialLocale={initialLocale} dictionaries={contentGeneratorDictionaries}>
          <SessionProvider>
            <Shell>{children}</Shell>
          </SessionProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
