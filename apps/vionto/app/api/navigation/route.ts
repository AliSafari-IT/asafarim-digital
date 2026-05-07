import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { auth } from "@asafarim/auth";
import { resolveNavigation } from "@asafarim/navigation";
import { APP_CODES, type AppCode, type NavPlacement, type NavItemDto } from "@asafarim/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const app = searchParams.get("app") as AppCode | null;
    if (!app || !APP_CODES.includes(app)) {
      return NextResponse.json(
        { error: "Invalid or missing 'app' parameter", validApps: APP_CODES },
        { status: 400 }
      );
    }

    const placement = searchParams.get("placement") as NavPlacement | null;
    const group = searchParams.get("group") || undefined;
    const flat = searchParams.get("flat") === "true";

    if (placement && !["header", "sidebar", "footer", "command"].includes(placement)) {
      return NextResponse.json(
        { error: "Invalid 'placement' parameter", validPlacements: ["header", "sidebar", "footer", "command"] },
        { status: 400 }
      );
    }

    const session = await auth();
    const user = session?.user
      ? {
          authenticated: true,
          roles: (session.user as { roles?: string[] }).roles ?? [],
          permissions: (session.user as { permissions?: string[] }).permissions ?? [],
        }
      : { authenticated: false, roles: [], permissions: [] };

    const items = await prisma.navItem.findMany({
      where: { isActive: true },
      orderBy: [{ group: "asc" }, { position: "asc" }],
      select: {
        id: true,
        label: true,
        labelKey: true,
        href: true,
        position: true,
        visibility: true,
        requiredRole: true,
        requiredPermissions: true,
        appScope: true,
        parentId: true,
        isActive: true,
        icon: true,
        target: true,
        group: true,
        placement: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
        children: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            label: true,
            labelKey: true,
            href: true,
            position: true,
            visibility: true,
            requiredRole: true,
            requiredPermissions: true,
            appScope: true,
            parentId: true,
            isActive: true,
            icon: true,
            target: true,
            group: true,
            placement: true,
            metadata: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });

    const resolved = resolveNavigation({
      items: items as NavItemDto[],
      currentApp: app,
      user,
      placement: placement || undefined,
      group,
    });

    if (flat) {
      const flatten = (items: typeof resolved.items): typeof resolved.items => {
        const result: typeof resolved.items = [];
        for (const item of items) {
          const { children, ...rest } = item;
          result.push(rest as typeof item);
          if (children && children.length > 0) {
            result.push(...flatten(children));
          }
        }
        return result;
      };

      return NextResponse.json(
        {
          items: flatten(resolved.items),
          groups: resolved.groups,
          totalCount: resolved.totalCount,
          visibleCount: resolved.visibleCount,
        },
        {
          headers: {
            "Cache-Control": user.authenticated
              ? "private, no-cache"
              : "public, s-maxage=60, stale-while-revalidate=300",
          },
        }
      );
    }

    return NextResponse.json(resolved, {
      headers: {
        "Cache-Control": user.authenticated
          ? "private, no-cache"
          : "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (error) {
    console.error("Vionto navigation API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
