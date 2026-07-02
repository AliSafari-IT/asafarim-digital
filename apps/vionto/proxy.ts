import { createAuthMiddleware } from "@asafarim/auth/middleware";

const portalUrl =
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_PORTAL_URL || process.env.PORTAL_URL || "http://localhost:3000"
    : process.env.PORTAL_URL || process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal.asafarim.com";

export const proxy = createAuthMiddleware({
  publicRoutes: [
    "/",
    "/create",
    "/api/health",
    "/api/navigation",
    "/api/projects",
    "/api/render",
    "/api/exports",
    "/api/audio",
    "/api/auth",
  ],
  signInUrl: `${portalUrl}/sign-in`,
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
