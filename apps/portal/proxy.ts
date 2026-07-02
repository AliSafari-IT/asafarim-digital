import { createAuthMiddleware } from "@asafarim/auth/middleware";

export const proxy = createAuthMiddleware({
  publicRoutes: [
    "/",
    "/about",
    "/showcase",
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/health",
    "/api/navigation",
  ],
  roleRoutes: {
    "/admin": ["superadmin", "admin"],
  },
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
