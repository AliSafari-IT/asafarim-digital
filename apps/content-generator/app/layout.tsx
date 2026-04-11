import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "asafarim-digital — AI Content Generator",
  description:
    "Generate high-quality blog posts, product copy, emails, social captions, and summaries with the asafarim-digital AI Content Generator.",
  keywords: ["asafarim", "ai", "content generator", "saas", "copywriting"],
};

export default function RootLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[var(--color-surface)] text-[var(--color-text)] antialiased">
        {children}
      </body>
    </html>
  );
}
