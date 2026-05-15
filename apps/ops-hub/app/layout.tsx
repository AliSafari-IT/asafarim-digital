import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { cookies } from "next/headers";
import Script from "next/script";
import { auth } from "@asafarim/auth";
import { readThemeFromCookie, themeInitScript } from "../../../packages/ui/src/theme";
import { Shell } from "@/components/Shell";
import "./globals.css";
import "@asafarim/navigation/styles.css";

const appUrl = process.env.NEXT_PUBLIC_OPS_HUB_URL ?? process.env.OPS_HUB_URL ?? "https://ops-hub.asafarim.com";
const appTitle = "SaaS Operations Hub";
const appDescription = "Private operator console for SaaS lifecycle, billing, feature access, tenant operations, and automations.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: appTitle,
    template: `%s | ${appTitle}`,
  },
  description: appDescription,
  alternates: {
    canonical: appUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    siteName: appTitle,
    title: appTitle,
    description: appDescription,
  },
  twitter: {
    card: "summary",
    title: appTitle,
    description: appDescription,
  },
  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const cookieStore = await cookies();
  const cookieTheme = readThemeFromCookie(cookieStore.toString());
  const initialTheme = cookieTheme ?? "dark";

  const user = {
    name: session?.user?.name ?? null,
    email: session?.user?.email ?? "",
    roles: session?.user?.roles ?? [],
  };

  return (
    <html lang="en" suppressHydrationWarning data-theme={initialTheme}>
      <body>
        <Script
          id="theme-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: themeInitScript,
          }}
        />
        <SessionProvider>
          <Shell user={user}>{children}</Shell>
        </SessionProvider>
      </body>
    </html>
  );
}

