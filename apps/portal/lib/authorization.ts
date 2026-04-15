import { auth } from "@asafarim/auth";
import { prisma } from "@asafarim/db";

/**
 * Get current user's roles and permissions from the session/DB.
 * Returns null if not authenticated.
 */
export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

/**
 * Check if the current user has a specific role.
 */
export function hasRole(userRoles: string[], role: string): boolean {
  return userRoles.includes(role);
}

/**
 * Check if the current user is a superadmin (bypasses all permission checks).
 */
export function isSuperAdmin(userRoles: string[]): boolean {
  return userRoles.includes("superadmin");
}

/**
 * Check if the current user is at least an admin.
 */
export function isAdmin(userRoles: string[]): boolean {
  return userRoles.includes("superadmin") || userRoles.includes("admin");
}

/**
 * Load user permissions from the database by resolving all roles → permissions.
 * Superadmin bypasses this entirely.
 */
export async function getUserPermissions(userId: string): Promise<string[]> {
  const userWithRoles = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      userRoles: {
        select: {
          role: {
            select: {
              name: true,
              rolePermissions: {
                select: {
                  permission: { select: { name: true } },
                },
              },
            },
          },
        },
      },
    },
  });

  if (!userWithRoles) return [];

  // If superadmin, return special marker
  const roleNames = userWithRoles.userRoles.map((ur) => ur.role.name);
  if (roleNames.includes("superadmin")) return ["*"];

  // Collect unique permission names from all roles
  const permissions = new Set<string>();
  for (const ur of userWithRoles.userRoles) {
    for (const rp of ur.role.rolePermissions) {
      permissions.add(rp.permission.name);
    }
  }

  return Array.from(permissions);
}

/**
 * Check if a user has a specific permission.
 */
export function hasPermission(permissions: string[], permission: string): boolean {
  if (permissions.includes("*")) return true; // superadmin
  return permissions.includes(permission);
}

/**
 * Server-side guard: require authentication + specific permission.
 * Returns the session user if authorized, throws otherwise.
 */
export async function requirePermission(permission: string) {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthorizationError("Authentication required", 401);
  }

  const permissions = await getUserPermissions(user.id);
  if (!hasPermission(permissions, permission)) {
    throw new AuthorizationError("Insufficient permissions", 403);
  }

  return { user, permissions };
}

/**
 * Server-side guard: require admin or superadmin role.
 */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user) {
    throw new AuthorizationError("Authentication required", 401);
  }

  if (!isAdmin(user.roles)) {
    throw new AuthorizationError("Admin access required", 403);
  }

  const permissions = await getUserPermissions(user.id);
  return { user, permissions };
}

/**
 * Create an audit log entry.
 */
export async function createAuditLog(params: {
  userId?: string | null;
  action: string;
  entity: string;
  entityId?: string;
  changes?: Record<string, unknown>;
  ipAddress?: string;
}) {
  return prisma.auditLog.create({
    data: {
      userId: params.userId ?? null,
      action: params.action,
      entity: params.entity,
      entityId: params.entityId ?? null,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      changes: (params.changes ?? undefined) as any,
      ipAddress: params.ipAddress ?? null,
    },
  });
}

export class AuthorizationError extends Error {
  status: number;
  constructor(message: string, status: number = 403) {
    super(message);
    this.name = "AuthorizationError";
    this.status = status;
  }
}
