import { NextResponse } from "next/server";
import { auth } from "@asafarim/auth";
import { prisma } from "@asafarim/db";

const portalUrl = process.env.NEXT_PUBLIC_PORTAL_URL || "https://portal.asafarim.com";
const opsHubUrl = process.env.NEXT_PUBLIC_OPS_HUB_URL || "http://localhost:3003";

function redirectUrl(path: string) {
  return new URL(path, opsHubUrl);
}

export async function POST() {
  const session = await auth();

  if (!session?.user?.id) {
    const signInUrl = new URL("/sign-in", portalUrl);
    signInUrl.searchParams.set("callbackUrl", redirectUrl("/?access=required").toString());
    return NextResponse.redirect(signInUrl, { status: 303 });
  }

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "ops_access_requested",
      entity: "OpsHubAccess",
      entityId: session.user.id,
      changes: {
        requestedRoles: ["ops_viewer", "ops_admin", "superadmin"],
        source: "ops-hub",
      },
    },
  });

  return NextResponse.redirect(redirectUrl("/?access=requested#access-request"), { status: 303 });
}

export function GET() {
  return NextResponse.redirect(redirectUrl("/?access=required"), { status: 303 });
}
