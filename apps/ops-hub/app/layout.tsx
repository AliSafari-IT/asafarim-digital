import type { Metadata } from "next";
import { SessionProvider } from "next-auth/react";
import { cookies } from "next/headers";
import { auth } from "@asafarim/auth";
import { readThemeFromCookie, themeInitScript } from "../../../packages/ui/src/theme";
import { Shell } from "@/components/Shell";
import { ForbiddenError, requireOps } from "@/lib/rbac";
import "./globals.css";

export const metadata: Metadata = {
  title: "SaaS Operations Hub",
  description: "Internal operator console for SaaS lifecycle, billing, feature access, and automations.",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const cookieStore = await cookies();
  const cookieTheme = readThemeFromCookie(cookieStore.toString());
  const initialTheme = cookieTheme ?? "dark";

  let forbidden: string | null = null;
  try {
    await requireOps("read");
  } catch (e) {
    if (e instanceof ForbiddenError) forbidden = e.message;
    else throw e;
  }

  const user = {
    name: session?.user?.name ?? null,
    email: session?.user?.email ?? "",
    roles: session?.user?.roles ?? [],
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
          {forbidden ? (
            <ForbiddenScreen message={forbidden} email={user.email} />
          ) : (
            <Shell user={user}>{children}</Shell>
          )}
        </SessionProvider>
      </body>
    </html>
  );
}

function ForbiddenScreen({ message, email }: { message: string; email: string }) {
  const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal-qa.asafarim.com";
  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <div className="w-full max-w-md rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-rose-500/15 text-rose-300 text-2xl">⛔</div>
        <h1 className="text-xl font-semibold text-[var(--color-text)]">Access restricted</h1>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">{message}</p>
        {email && <p className="mt-4 text-xs text-[var(--color-text-subtle)]">Signed in as {email}</p>}
        <a
          href={portalUrl}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:brightness-110"
        >
          Return to Portal
        </a>
      </div>
    </div>
  );
}
