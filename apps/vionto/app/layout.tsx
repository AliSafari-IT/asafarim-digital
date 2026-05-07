import type { Metadata } from "next";
import type { ReactNode } from "react";
import { ViontoNav } from "@/components/ViontoNav";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_VIONTO_URL ?? "https://vionto.asafarim.com";
const appName = "Vionto";
const appDescription =
  "AI-powered photo-to-story video creator for transforming image collections into narrated MP4 memories.";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: `${appName} | Photo-to-Story Video`,
    template: `%s | ${appName}`,
  },
  description: appDescription,
  applicationName: appName,
  keywords: ["Vionto", "photo video maker", "AI storytelling", "narrated MP4", "image slideshow"],
  alternates: {
    canonical: appUrl,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: appUrl,
    siteName: appName,
    title: `${appName} | Photo-to-Story Video`,
    description: appDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: `${appName} | Photo-to-Story Video`,
    description: appDescription,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <ViontoNav />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
