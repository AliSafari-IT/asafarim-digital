import { auth } from "@asafarim/auth";
import { NextResponse } from "next/server";

export type AuthedUser = {
  email: string;
  id: string;
  tenantId: string | null;
  roles: string[];
};

export async function getAuthedUser(): Promise<AuthedUser | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;
  return {
    id: userId,
    email: session.user.email ?? "",
    tenantId: session.user.tenantId ?? null,
    roles: session.user.roles ?? [],
  };
}

export async function requireAuth(): Promise<AuthedUser> {
  const user = await getAuthedUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export function unauthorized(): NextResponse {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden(message = "Forbidden"): NextResponse {
  return NextResponse.json({ error: message }, { status: 403 });
}

export function notFound(): NextResponse {
  return NextResponse.json({ error: "Not found" }, { status: 404 });
}

export function badRequest(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function serverError(scope: string, error: unknown): NextResponse {
  console.error(`[vionto][${scope}]`, error);
  const isDev = process.env.NODE_ENV !== "production";
  return NextResponse.json(
    {
      error: "Internal server error",
      ...(isDev
        ? { scope, message: error instanceof Error ? error.message : String(error) }
        : {}),
    },
    { status: 500 },
  );
}
