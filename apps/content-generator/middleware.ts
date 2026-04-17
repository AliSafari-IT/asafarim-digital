import { createAuthMiddleware } from "@asafarim/auth/middleware";

const portalUrl = process.env.PORTAL_URL || "https://portal-qa.asafarim.com";

export const middleware = createAuthMiddleware({
  // Registered users only — only the health check is public
  publicRoutes: ["/api/health"],
  // Redirect to portal for sign-in (centralized auth)
  signInUrl: `${portalUrl}/sign-in`,
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
