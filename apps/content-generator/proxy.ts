import { createAuthMiddleware } from "@asafarim/auth/middleware";

const portalUrl = process.env.PORTAL_URL || "https://portal.asafarim.com";

export const proxy = createAuthMiddleware({
  // Public routes: health check and guest homepage
  publicRoutes: ["/api/health", "/"],
  // Redirect to portal for sign-in (centralized auth)
  signInUrl: `${portalUrl}/sign-in`,
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
