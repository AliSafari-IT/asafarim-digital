import { createAuthMiddleware } from "@asafarim/auth/middleware";

const portalUrl = process.env.PORTAL_URL || "https://portal.asafarim.com";

export const proxy = createAuthMiddleware({
  // Public surface: marketing landing + health probe.
  // Everything else requires an authenticated session.
  publicRoutes: ["/", "/api/health"],
  signInUrl: `${portalUrl}/sign-in`,
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
