import type { Metadata } from "next";
import type { ReactNode } from "react";
import { cookies } from "next/headers";
import { SessionProvider } from "@/components/SessionProvider";
import { EduNav } from "@/components/EduNav";
import { EduFooter } from "@/components/EduFooter";
import { I18nProvider } from "@asafarim/shared-i18n";
import { resolveLocaleFromCookie } from "@asafarim/shared-i18n/server";
import { readThemeFromCookie, themeInitScript } from "@asafarim/ui";
import { edumatchDictionaries } from "@/lib/i18n-dictionaries";
import "./globals.css";

const appName = "EduMatch";
const appDescription =
  "AI-first homework help and a tutor marketplace — get unstuck or get matched.";

export const metadata: Metadata = {
  title: {
    default: `${appName} | AI homework help & tutor marketplace`,
    template: `%s | ${appName}`,
  },
  description: appDescription,
  applicationName: appName,
  robots: {
    index: false,
    follow: false,
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
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
      </head>
      <body className="flex min-h-screen flex-col bg-[var(--color-bg)] text-[var(--color-text)] antialiased">
        <I18nProvider initialLocale={initialLocale} dictionaries={edumatchDictionaries}>
          <SessionProvider>
            <EduNav />
            <main className="flex-1">{children}</main>
            <EduFooter />
          </SessionProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
