import { prisma } from "@asafarim/db";
import type {
  EduStudentProfile,
  EduTutorProfile,
} from "@asafarim/db";
import { getAuthedUser, type AuthedUser } from "./auth";

/**
 * EduMatch resolves "role" by which profile rows exist for the user:
 *   - STUDENT  → has an EduStudentProfile
 *   - TUTOR    → has an EduTutorProfile
 *   - ADMIN    → has the global "admin" or "superadmin" role from the
 *                shared RBAC tables (User.userRoles → Role.name)
 *
 * A single user can be both STUDENT and TUTOR. The helpers below let
 * route handlers state their requirement explicitly and fail closed.
 */
export type EduRole = "STUDENT" | "TUTOR" | "ADMIN";

export type StudentContext = {
  user: AuthedUser;
  profile: EduStudentProfile;
};

export type TutorContext = {
  user: AuthedUser;
  profile: EduTutorProfile;
};

const ADMIN_ROLE_NAMES = new Set(["admin", "superadmin"]);

export function isAdmin(user: AuthedUser): boolean {
  return user.roles.some((r) => ADMIN_ROLE_NAMES.has(r));
}

/** Fetch the EduStudentProfile for a user, or null if they aren't a student. */
export async function getStudentProfile(
  userId: string,
): Promise<EduStudentProfile | null> {
  return prisma.eduStudentProfile.findUnique({ where: { userId } });
}

/** Fetch the EduTutorProfile for a user, or null if they aren't a tutor. */
export async function getTutorProfile(
  userId: string,
): Promise<EduTutorProfile | null> {
  return prisma.eduTutorProfile.findUnique({ where: { userId } });
}

/**
 * Resolve the authenticated user's effective EduMatch roles. ADMIN is granted
 * via the shared RBAC roles; STUDENT / TUTOR are granted by profile presence.
 */
export async function getEduRoles(user: AuthedUser): Promise<EduRole[]> {
  const [student, tutor] = await Promise.all([
    getStudentProfile(user.id),
    getTutorProfile(user.id),
  ]);

  const roles: EduRole[] = [];
  if (isAdmin(user)) roles.push("ADMIN");
  if (student) roles.push("STUDENT");
  if (tutor) roles.push("TUTOR");
  return roles;
}

/**
 * Require an authenticated user with at least one of the given EduMatch roles.
 * ADMIN always satisfies any role check.
 *
 * Throws an `EduAuthError` whose `status` is the appropriate HTTP code; route
 * handlers should map these to JSON responses via the helpers in `auth.ts`.
 */
export class EduAuthError extends Error {
  constructor(
    public status: 401 | 403,
    message: string,
  ) {
    super(message);
    this.name = "EduAuthError";
  }
}

export async function requireRole(
  ...allowed: EduRole[]
): Promise<{ user: AuthedUser; roles: EduRole[] }> {
  const user = await getAuthedUser();
  if (!user) throw new EduAuthError(401, "Unauthorized");

  const roles = await getEduRoles(user);
  if (roles.includes("ADMIN")) return { user, roles };

  const ok = allowed.some((r) => roles.includes(r));
  if (!ok) throw new EduAuthError(403, `Requires one of: ${allowed.join(", ")}`);

  return { user, roles };
}

/** Convenience: require STUDENT and return the resolved profile. */
export async function requireStudent(): Promise<StudentContext> {
  const user = await getAuthedUser();
  if (!user) throw new EduAuthError(401, "Unauthorized");

  const profile = await getStudentProfile(user.id);
  if (!profile && !isAdmin(user)) {
    throw new EduAuthError(403, "Student profile required");
  }
  if (!profile) throw new EduAuthError(403, "Student profile required");

  return { user, profile };
}

/** Convenience: require TUTOR and return the resolved profile. */
export async function requireTutor(): Promise<TutorContext> {
  const user = await getAuthedUser();
  if (!user) throw new EduAuthError(401, "Unauthorized");

  const profile = await getTutorProfile(user.id);
  if (!profile && !isAdmin(user)) {
    throw new EduAuthError(403, "Tutor profile required");
  }
  if (!profile) throw new EduAuthError(403, "Tutor profile required");

  return { user, profile };
}
