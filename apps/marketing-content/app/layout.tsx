import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { cookies } from "next/headers";
import { auth } from "@asafarim/auth";
import { readThemeFromCookie, themeInitScript } from "../../../packages/ui/src/theme";
import { Shell } from "@/components/Shell";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_MARKETING_CONTENT_URL ?? process.env.MARKETING_CONTENT_URL ?? "https://marketing-content.asafarim.com";
const appTitle = "Marketing + Content Engine";
const appDescription = "Private growth workspace for campaigns, content, SEO operations, leads, and marketing automations.";

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
  };

  return (
    <html lang="en" suppressHydrationWarning data-theme={initialTheme}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeInitScript,
          }}
        />
      </head>
      <body>
        <SessionProvider>
          <Shell user={user}>{children}</Shell>
        </SessionProvider>
      </body>
    </html>
  );
}
