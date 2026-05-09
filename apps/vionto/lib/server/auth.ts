import { auth } from "@asafarim/auth";
import { prisma } from "@asafarim/db";
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
  const email = session.user.email ?? "";

  try {
    const existingById = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, tenantId: true, userRoles: { select: { role: { select: { name: true } } } } },
    });
    if (existingById) {
      return {
        id: existingById.id,
        email: existingById.email,
        tenantId: existingById.tenantId,
        roles: existingById.userRoles.map((item) => item.role.name),
      };
    }

    if (email) {
      const existingByEmail = await prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, tenantId: true, userRoles: { select: { role: { select: { name: true } } } } },
      });
      if (existingByEmail) {
        return {
          id: existingByEmail.id,
          email: existingByEmail.email,
          tenantId: existingByEmail.tenantId,
          roles: existingByEmail.userRoles.map((item) => item.role.name),
        };
      }

      const created = await prisma.user.create({
        data: {
          id: userId,
          email,
          name: session.user.name ?? null,
          image: session.user.image ?? null,
          emailVerified: session.user.emailVerified ? new Date(session.user.emailVerified) : null,
        },
        select: { id: true, email: true, tenantId: true },
      });
      return {
        id: created.id,
        email: created.email,
        tenantId: created.tenantId,
        roles: session.user.roles ?? [],
      };
    }
  } catch (error) {
    console.error("[vionto][auth] failed to resolve database user", error);
  }

  return {
    id: userId,
    email,
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
