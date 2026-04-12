import { createAuthMiddleware } from "@asafarim/auth/middleware";

export const middleware = createAuthMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    "/",
    "/about",
    "/showcase",
    "/sign-in",
    "/sign-up",
    "/api/health",
  ],
  // Admin-only routes
  roleRoutes: {
    "/admin": ["ADMIN"],
  },
});

export const config = {
  // Match all routes except static files and images
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
