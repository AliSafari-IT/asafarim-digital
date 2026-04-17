import { auth } from "@asafarim/auth";
import { redirect } from "next/navigation";

export const OPS_ROLES = ["ops_admin", "ops_viewer", "superadmin"] as const;
export const OPS_WRITE_ROLES = ["ops_admin", "superadmin"] as const;

export type OpsCapability = "read" | "write";

export interface OpsSession {
  userId: string;
  email: string;
  name: string | null;
  roles: string[];
  canWrite: boolean;
}

export class ForbiddenError extends Error {
  status = 403;
  constructor(message = "Forbidden") {
    super(message);
  }
}

export async function requireOps(capability: OpsCapability = "read"): Promise<OpsSession> {
  const session = await auth();
  if (!session?.user?.id) {
    // Middleware will have already redirected unauthenticated users, but be safe.
    redirect("/");
  }
  const roles = session.user.roles ?? [];
  const hasRead = roles.some((r) => (OPS_ROLES as readonly string[]).includes(r));
  if (!hasRead) {
    throw new ForbiddenError("Your account does not have access to the SaaS Operations Hub.");
  }
  const canWrite = roles.some((r) => (OPS_WRITE_ROLES as readonly string[]).includes(r));
  if (capability === "write" && !canWrite) {
    throw new ForbiddenError("Write access requires the ops_admin role.");
  }
  return {
    userId: session.user.id,
    email: session.user.email ?? "",
    name: session.user.name ?? null,
    roles,
    canWrite,
  };
}
