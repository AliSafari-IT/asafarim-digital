import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
        
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Re-export types for convenience
export { PrismaClient, Prisma } from "@prisma/client";
export type {
  User,
  Account,
  Session,
  Tenant,
  VerificationToken,
  Role,
  Permission,
  UserRole,
  RolePermission,
  SiteContent,
  NavItem,
  SiteSetting,
  AuditLog,
  ContentTypeDefinition,
  EduStudentProfile,
  EduTutorProfile,
  EduInquiry,
  EduAiResponse,
  EduQuoteRequest,
  EduQuote,
  EduBooking,
  EduTransaction,
  EduWallet,
  EduNotification,
  EduMessage,
  Cart,
  CartItem,
} from "@prisma/client";
