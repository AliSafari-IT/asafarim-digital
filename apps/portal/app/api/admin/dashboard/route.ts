import { NextResponse } from "next/server";
import { prisma } from "@asafarim/db";
import { requireAdmin } from "@/lib/authorization";
import { AuthorizationError } from "@/lib/authorization";

export async function GET() {
  try {
    await requireAdmin();

    const [
      totalUsers,
      activeUsers,
      recentUsers,
      roleDistribution,
      contentSections,
      publishedContent,
      navItems,
      settingsCount,
      recentAuditLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isActive: true } }),
      prisma.user.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          isActive: true,
          createdAt: true,
          userRoles: { select: { role: { select: { name: true, displayName: true } } } },
        },
      }),
      prisma.userRole.groupBy({
        by: ["roleId"],
        _count: { userId: true },
      }),
      prisma.siteContent.count(),
      prisma.siteContent.count({ where: { isPublished: true } }),
      prisma.navItem.count({ where: { isActive: true } }),
      prisma.siteSetting.count(),
      prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 15,
        select: {
          id: true,
          action: true,
          entity: true,
          entityId: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
        },
      }),
    ]);

    // Resolve role names for distribution
    const roleIds = roleDistribution.map((r) => r.roleId);
    const roles = await prisma.role.findMany({
      where: { id: { in: roleIds } },
      select: { id: true, name: true, displayName: true },
    });
    const roleMap = new Map(roles.map((r) => [r.id, r]));

    const roleStats = roleDistribution.map((r) => ({
      roleId: r.roleId,
      roleName: roleMap.get(r.roleId)?.name ?? "unknown",
      displayName: roleMap.get(r.roleId)?.displayName ?? "Unknown",
      userCount: r._count.userId,
    }));

    return NextResponse.json({
      stats: {
        totalUsers,
        activeUsers,
        inactiveUsers: totalUsers - activeUsers,
        contentSections,
        publishedContent,
        navItems,
        settingsCount,
      },
      roleDistribution: roleStats,
      recentUsers,
      recentAuditLogs,
    });
  } catch (error) {
    if (error instanceof AuthorizationError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("Dashboard API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
