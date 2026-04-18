import { createAuthMiddleware } from "@asafarim/auth/middleware";

const portalUrl = process.env.PORTAL_URL || "https://portal-qa.asafarim.com";

// All routes require a signed-in user. Only /api/health is public for container probes.
// No role gate: this app is available to every authenticated user in the SSO session.
export const middleware = createAuthMiddleware({
  publicRoutes: ["/api/health"],
  signInUrl: `${portalUrl}/sign-in`,
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
