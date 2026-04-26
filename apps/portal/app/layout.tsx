import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import { cookies } from "next/headers";
import { readThemeFromCookie, themeInitScript } from "../../../packages/ui/src/theme";
import { SessionProvider } from "@/components/SessionProvider";
import { AttributionCapture } from "@/components/AttributionCapture";
import { I18nProvider } from "@asafarim/shared-i18n";
import { resolveLocaleFromCookie } from "@asafarim/shared-i18n/server";
import { portalDictionaries } from "../lib/i18n-dictionaries";
import { StructuredData, absoluteUrl, organizationSchema, siteDescription, siteName, websiteSchema } from "@/lib/seo";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-sans",
});

const ibmPlexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(absoluteUrl("/")),
  title: {
    default: `${siteName} | Full-Stack SaaS and AI Product Engineering`,
    template: `%s | ${siteName}`,
  },
  description: siteDescription,
  applicationName: siteName,
  authors: [{ name: "Ali Safari" }],
  creator: "Ali Safari",
  publisher: siteName,
  keywords: [
    "ASafariM Digital",
    "SaaS product engineering",
    "AI workflows",
    "Next.js development",
    "backend architecture",
    "full-stack developer",
  ],
  alternates: {
    canonical: absoluteUrl("/"),
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: absoluteUrl("/"),
    siteName,
    title: `${siteName} | Full-Stack SaaS and AI Product Engineering`,
    description: siteDescription,
    images: [
      {
        url: absoluteUrl("/opengraph-image"),
        width: 1200,
        height: 630,
        alt: `${siteName} social preview`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteName} | Full-Stack SaaS and AI Product Engineering`,
    description: siteDescription,
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
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
    other: {
      "msvalidate.01": process.env.BING_SITE_VERIFICATION ? [process.env.BING_SITE_VERIFICATION] : [],
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
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieTheme = readThemeFromCookie(cookieStore.toString());
  const initialTheme = cookieTheme ?? "dark";
  const initialLocale = resolveLocaleFromCookie(cookieStore.toString());

  return (
    <html lang={initialLocale} suppressHydrationWarning data-theme={initialTheme} className={`${manrope.variable} ${ibmPlexMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeInitScript,
          }}
        />
        <StructuredData data={[organizationSchema(), websiteSchema()]} />
      </head>
      <body className="bg-[var(--color-surface)] text-[var(--color-text)] antialiased">
        <AttributionCapture />
        <I18nProvider initialLocale={initialLocale} dictionaries={portalDictionaries}>
          <SessionProvider>{children}</SessionProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
