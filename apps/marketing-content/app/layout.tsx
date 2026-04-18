import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { auth } from "@asafarim/auth";
import { Shell } from "@/components/Shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "Marketing + Content Engine",
  description: "Growth system for campaigns, content, SEO, leads, and marketing automations.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  const user = {
    name: session?.user?.name ?? null,
    email: session?.user?.email ?? "",
  };

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          // Apply saved theme before paint to avoid FOUC.
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.dataset.theme=t;}catch(e){document.documentElement.dataset.theme='dark';}})();`,
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
