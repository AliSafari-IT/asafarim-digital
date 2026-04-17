import { prisma } from "@asafarim/db";

interface AuditEntry {
  userId: string;
  action: string;
  entity: string;
  entityId?: string | null;
  changes?: Record<string, unknown>;
  ipAddress?: string | null;
}

export async function logOpsAudit(entry: AuditEntry) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: entry.userId,
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId ?? null,
        changes: entry.changes as never,
        ipAddress: entry.ipAddress ?? null,
      },
    });
  } catch (error) {
    // Never let audit failure block the actual operation
    console.error("[ops-hub] audit log failed", error);
  }
}
