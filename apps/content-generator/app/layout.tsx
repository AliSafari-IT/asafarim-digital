import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SessionProvider } from "@/components/SessionProvider";
import { Shell } from "@/components/Shell";
import "./globals.css";

export const metadata: Metadata = {
  title: "asafarim-digital — AI Content Generator",
  description:
    "Generate high-quality blog posts, product copy, emails, social captions, and summaries with the asafarim-digital AI Content Generator.",
  keywords: ["asafarim", "ai", "content generator", "saas", "copywriting"],
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                function getTheme() {
                  const stored = localStorage.getItem('asafarim-theme');
                  if (stored) return stored;
                  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
                }
                const theme = getTheme();
                document.documentElement.dataset.theme = theme;
              })();
            `,
          }}
        />
      </head>
      <body className="bg-[var(--color-surface)] text-[var(--color-text)] antialiased">
        <SessionProvider>
          <Shell>{children}</Shell>
        </SessionProvider>
      </body>
    </html>
  );
}
