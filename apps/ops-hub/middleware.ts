import { createAuthMiddleware } from "@asafarim/auth/middleware";

const portalUrl = process.env.PORTAL_URL || "https://portal-qa.asafarim.com";

// All routes require auth + ops_admin/ops_viewer role (enforced in page/API via lib/rbac).
// Middleware simply ensures the user is signed in; role gating is done server-side for
// clear 403 pages instead of silent redirects.
export const middleware = createAuthMiddleware({
  publicRoutes: ["/api/health"],
  signInUrl: `${portalUrl}/sign-in`,
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
