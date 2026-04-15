import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * Configurable auth middleware for any app in the monorepo.
 *
 * Usage in each app's middleware.ts:
 *
 * ```ts
 * export { authMiddleware as middleware } from "@asafarim/auth/middleware";
 * export const config = { matcher: ["/dashboard/:path*", "/api/protected/:path*"] };
 * ```
 *
 * Or with custom logic:
 *
 * ```ts
 * import { createAuthMiddleware } from "@asafarim/auth/middleware";
 * export const middleware = createAuthMiddleware({
 *   publicRoutes: ["/", "/about", "/api/health"],
 *   signInUrl: "https://portal-qa.asafarim.com/sign-in",
 * });
 * ```
 */

interface AuthMiddlewareOptions {
  /** Routes that don't require authentication */
  publicRoutes?: string[];
  /** URL to redirect unauthenticated users to (defaults to /sign-in) */
  signInUrl?: string;
  /** Routes that require specific roles */
  roleRoutes?: Record<string, string[]>;
}

export function createAuthMiddleware(options: AuthMiddlewareOptions = {}) {
  const {
    publicRoutes = ["/", "/api/health"],
    signInUrl,
    roleRoutes = {},
  } = options;

  return async (req: NextRequest) => {
    const { pathname } = req.nextUrl;

    // Allow public routes
    const isPublic = publicRoutes.some(
      (route) => pathname === route || pathname.startsWith(route + "/")
    );
    if (isPublic) return NextResponse.next();

    // Allow Auth.js API routes
    if (pathname.startsWith("/api/auth")) return NextResponse.next();

    // Check authentication
    const token = await getToken({ req, secret: process.env.AUTH_SECRET });
    if (!token?.sub) {
      // Redirect to sign-in (on portal, or current app's /sign-in)
      const redirectUrl = signInUrl
        ? new URL(signInUrl)
        : new URL("/sign-in", req.nextUrl.origin);

      // Pass the callback URL so user returns after sign-in
      redirectUrl.searchParams.set("callbackUrl", req.nextUrl.href);
      return NextResponse.redirect(redirectUrl);
    }

    // Check role-based access
    for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
      if (
        pathname === route ||
        pathname.startsWith(route + "/")
      ) {
        const userRole = typeof token.role === "string" ? token.role : undefined;
        if (!userRole || !allowedRoles.includes(userRole)) {
          return NextResponse.json(
            { error: "Forbidden" },
            { status: 403 }
          );
        }
      }
    }

    return NextResponse.next();
  };
}

/**
 * Default middleware — protects everything except public routes.
 * Apps can override with createAuthMiddleware() for custom behavior.
 */
export const authMiddleware = createAuthMiddleware();
