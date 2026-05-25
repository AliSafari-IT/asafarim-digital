import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const databaseUrl =
  process.env.DATABASE_URL ?? "postgresql://user:password@localhost:5432/asafarim";

const adapter = new PrismaPg({ connectionString: databaseUrl });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
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
  UserLocation,
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
  ViontoProject,
  ViontoAsset,
  ViontoScript,
  ViontoAudioTrack,
  ViontoRenderJob,
  ViontoExport,
  ViontoAuditEvent,
} from "@prisma/client";
