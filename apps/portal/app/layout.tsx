import type { Metadata } from "next";
import { SessionProvider } from "@/components/SessionProvider";
import "./globals.css";

export const metadata: Metadata = {
  title: "ASafariM Digital — Developer Portal",
  description:
    "Unified developer portal for the ASafariM Digital ecosystem. Access apps, APIs, documentation, and platform status.",
  keywords: ["asafarim", "developer portal", "saas", "ai platform"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[var(--color-surface)] text-[var(--color-text)] antialiased">
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
