import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const portalUrl = process.env.PORTAL_URL || "https://portal.asafarim.com";
const opsRoles = ["ops_viewer", "ops_admin", "superadmin"];
const publicRoutes = ["/", "/api/health", "/api/auth", "/api/access-requests"];

function isPublicRoute(pathname: string) {
  return publicRoutes.some((route) => pathname === route || pathname.startsWith(route + "/"));
}

function publicOrigin(req: NextRequest) {
  const forwardedHost = req.headers.get("x-forwarded-host");
  const forwardedProto = req.headers.get("x-forwarded-proto") ?? "https";

  return (
    (forwardedHost ? `${forwardedProto}://${forwardedHost}` : null) ??
    process.env.AUTH_URL ??
    process.env.NEXT_PUBLIC_OPS_HUB_URL ??
    req.nextUrl.origin
  );
}

function redirectToSignIn(req: NextRequest) {
  const redirectUrl = new URL(`${portalUrl}/sign-in`);
  const callbackUrl = new URL(`${req.nextUrl.pathname}${req.nextUrl.search}`, publicOrigin(req));
  redirectUrl.searchParams.set("callbackUrl", callbackUrl.toString());
  return NextResponse.redirect(redirectUrl);
}

function redirectToAccessRequired(req: NextRequest) {
  const url = req.nextUrl.clone();
  url.pathname = "/";
  url.search = "";
  url.searchParams.set("access", "required");
  return NextResponse.redirect(url);
}

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isPublicRoute(pathname)) return NextResponse.next();

  const isProd = process.env.NODE_ENV === "production";
  const cookieName = isProd ? "__Secure-authjs.session-token" : "authjs.session-token";
  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    cookieName,
    salt: cookieName,
    secureCookie: isProd,
  });

  if (!token?.sub) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return redirectToSignIn(req);
  }

  if (token.isActive === false) {
    return NextResponse.json({ error: "Account deactivated" }, { status: 403 });
  }

  const userRoles = Array.isArray(token.roles) ? token.roles : [];
  const hasOpsRole = userRoles.some((role) => opsRoles.includes(role));

  if (!hasOpsRole) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return redirectToAccessRequired(req);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
