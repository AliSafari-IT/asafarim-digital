import { auth } from "@asafarim/auth";
import { NextResponse } from "next/server";

export type AuthedUser = {
  email: string;
  id: string;
  tenantId: string | null;
  roles: string[];
};

/**
 * Resolve the authenticated user from the next-auth session.
 * Returns null for anonymous requests.
 */
export async function getAuthedUser(): Promise<AuthedUser | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  return {
    id: userId,
    tenantId: session.user.tenantId ?? null,
    roles: session.user.roles ?? [],
  };
}

/** Standard 401 response helper. */
export function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/** Standard 403 response helper. */
export function forbidden(message = "Forbidden"): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

/**
 * Standard 404 response helper for resources the current user cannot access.
 * Returning 404 (not 403) prevents leaking the existence of other users' data.
 */
export function notFound(): NextResponse {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

/** Standard 400 response helper for invalid client input. */
export function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

/**
 * Centralised 500 helper that logs the underlying error to the server console
 * with a route tag, then returns a JSON 500 with optional dev-only details.
 */
export function serverError(scope: string, error: unknown): NextResponse {
  console.error(`[edumatch][${scope}]`, error);
  const isDev = process.env.NODE_ENV !== "production";
  return NextResponse.json(
    {
      error: "Internal server error",
      ...(isDev
        ? {
            scope,
            message: error instanceof Error ? error.message : String(error),
          }
        : {}),
    },
    { status: 500 },
  );
}
