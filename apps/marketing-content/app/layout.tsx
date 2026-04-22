import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { cookies } from "next/headers";
import { auth } from "@asafarim/auth";
import { readThemeFromCookie, themeInitScript } from "../../../packages/ui/src/theme";
import { Shell } from "@/components/Shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marketing + Content Engine",
  description: "Growth system for campaigns, content, SEO, leads, and marketing automations.",
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
