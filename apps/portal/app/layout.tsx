import type { Metadata } from "next";
import { IBM_Plex_Mono, Manrope } from "next/font/google";
import { cookies } from "next/headers";
import { readThemeFromCookie, themeInitScript } from "../../../packages/ui/src/theme";
import { SessionProvider } from "@/components/SessionProvider";
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
  title: "ASafariM Digital - Developer Portal",
  description:
    "Product engineering portal for ASafariM Digital. Premium SaaS delivery across frontend systems, backend architecture, and AI workflows.",
  keywords: ["asafarim", "developer portal", "saas", "ai platform", "next.js", "backend architecture"],
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

  return (
    <html lang="en" suppressHydrationWarning data-theme={initialTheme} className={`${manrope.variable} ${ibmPlexMono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: themeInitScript,
          }}
        />
      </head>
      <body className="bg-[var(--color-surface)] text-[var(--color-text)] antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
