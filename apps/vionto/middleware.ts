import { createAuthMiddleware } from "@asafarim/auth/middleware";

const portalUrl =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_PORTAL_URL || process.env.PORTAL_URL || "http://localhost:3000"
    : process.env.PORTAL_URL || process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal-qa.asafarim.com";

export const middleware = createAuthMiddleware({
  publicRoutes: ["/", "/api/health", "/api/navigation", "/api/projects", "/api/render", "/api/exports"],
  signInUrl: `${portalUrl}/sign-in`,
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
