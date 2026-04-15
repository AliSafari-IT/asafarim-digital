import { createAuthMiddleware } from "@asafarim/auth/middleware";

export const middleware = createAuthMiddleware({
  publicRoutes: [
    "/",
    "/about",
    "/showcase",
    "/sign-in",
    "/sign-up",
    "/forgot-password",
    "/reset-password",
    "/api/auth/forgot-password",
    "/api/auth/reset-password",
    "/api/health",
  ],
  roleRoutes: {
    "/admin": ["superadmin", "admin"],
  },
});

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
