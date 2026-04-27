import type { Metadata } from "next";
import type { ReactNode } from "react";
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

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning data-theme="dark">
      <body className="min-h-screen bg-[var(--color-bg)] text-[var(--color-text)] antialiased">
        {children}
      </body>
    </html>
  );
}
