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
    <html lang="en">
      <body>
        <SessionProvider>
          <Shell user={user}>{children}</Shell>
        </SessionProvider>
      </body>
    </html>
  );
}
