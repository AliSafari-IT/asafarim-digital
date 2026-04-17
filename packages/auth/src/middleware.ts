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
  /** Routes that require specific roles (user must have at least one) */
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

    // Check authentication.
    //
    // We pin cookieName/salt/secureCookie to match the NextAuth config in
    // packages/auth/src/index.ts. This is important in production where
    // nginx terminates TLS and forwards HTTP to Next.js: `getToken`'s
    // auto-detection would otherwise pick the non-secure cookie name
    // (`authjs.session-token`) while the browser actually holds
    // `__Secure-authjs.session-token`, so the token would never be found
    // and every request would be redirected to sign-in.
    const isProd = process.env.NODE_ENV === "production";
    const cookieName = isProd
      ? "__Secure-authjs.session-token"
      : "authjs.session-token";
    const token = await getToken({
      req,
      secret: process.env.AUTH_SECRET,
      cookieName,
      salt: cookieName,
      secureCookie: isProd,
    });
    if (!token?.sub) {
      // Never redirect API calls — return 401 JSON so fetch() callers can handle it
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }

      const redirectUrl = signInUrl
        ? new URL(signInUrl)
        : new URL("/sign-in", req.nextUrl.origin);

      const relativeCallbackUrl = `${req.nextUrl.pathname}${req.nextUrl.search}` || "/";
      redirectUrl.searchParams.set("callbackUrl", relativeCallbackUrl);
      return NextResponse.redirect(redirectUrl);
    }

    // Block deactivated users
    if (token.isActive === false) {
      return NextResponse.json(
        { error: "Account deactivated" },
        { status: 403 }
      );
    }

    // Check role-based access
    const userRoles: string[] = Array.isArray(token.roles) ? token.roles : [];
    const isSuperAdmin = userRoles.includes("superadmin");

    for (const [route, allowedRoles] of Object.entries(roleRoutes)) {
      if (pathname === route || pathname.startsWith(route + "/")) {
        // Superadmin always passes
        if (isSuperAdmin) continue;

        const hasRole = userRoles.some((r) => allowedRoles.includes(r));
        if (!hasRole) {
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
