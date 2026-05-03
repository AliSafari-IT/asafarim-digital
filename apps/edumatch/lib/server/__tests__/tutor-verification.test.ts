import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@asafarim/db", () => ({
  prisma: {
    eduTutorVerification: { findFirst: vi.fn(), findMany: vi.fn(), create: vi.fn() },
    eduTutorProfile: { update: vi.fn(), findMany: vi.fn() },
    eduAuditEvent: { create: vi.fn() },
  },
  Prisma: { JsonNull: Symbol("JsonNull") },
}));

import { prisma } from "@asafarim/db";
import {
  requestVerification,
  setTutorVerificationStatus,
  unverifiedTutorsExcluded,
} from "../tutor-verification";

beforeEach(() => {
  vi.mocked(prisma.eduTutorVerification.findFirst).mockReset();
  vi.mocked(prisma.eduTutorVerification.findMany).mockReset();
  vi.mocked(prisma.eduTutorVerification.create).mockReset();
  vi.mocked(prisma.eduTutorProfile.update).mockReset();
  vi.mocked(prisma.eduAuditEvent.create).mockReset();
  vi.mocked(prisma.eduAuditEvent.create).mockResolvedValue({} as never);
  vi.unstubAllEnvs();
});

describe("requestVerification", () => {
  it("returns existing pending review without creating a new one", async () => {
    vi.mocked(prisma.eduTutorVerification.findFirst).mockResolvedValue({
      id: "v1",
      status: "PENDING",
    } as never);
    const out = await requestVerification("t1");
    expect(out.id).toBe("v1");
    expect(prisma.eduTutorVerification.create).not.toHaveBeenCalled();
  });

  it("opens a fresh PENDING when latest review is terminal", async () => {
    vi.mocked(prisma.eduTutorVerification.findFirst).mockResolvedValue({
      id: "v0",
      status: "REJECTED",
    } as never);
    vi.mocked(prisma.eduTutorVerification.create).mockResolvedValue({
      id: "v2",
      status: "PENDING",
    } as never);
    const out = await requestVerification("t1");
    expect(out.id).toBe("v2");
    expect(prisma.eduTutorVerification.create).toHaveBeenCalled();
  });
});

describe("setTutorVerificationStatus", () => {
  beforeEach(() => {
    vi.mocked(prisma.eduTutorVerification.findFirst).mockResolvedValue({
      id: "v0",
      status: "PENDING",
    } as never);
    vi.mocked(prisma.eduTutorProfile.update).mockResolvedValue({} as never);
  });

  it("VERIFIED stamps verifiedAt on the profile", async () => {
    vi.mocked(prisma.eduTutorVerification.create).mockResolvedValue({
      id: "v1",
    } as never);
    await setTutorVerificationStatus({
      tutorId: "t1",
      reviewerId: "a1",
      status: "VERIFIED",
      checklist: { identityVerified: true },
    });
    const call = vi.mocked(prisma.eduTutorProfile.update).mock.calls[0]?.[0] as {
      data: { verifiedAt: Date | null };
    };
    expect(call.data.verifiedAt).toBeInstanceOf(Date);
  });

  it("REJECTED clears verifiedAt", async () => {
    vi.mocked(prisma.eduTutorVerification.create).mockResolvedValue({
      id: "v1",
    } as never);
    await setTutorVerificationStatus({
      tutorId: "t1",
      reviewerId: "a1",
      status: "REJECTED",
    });
    const call = vi.mocked(prisma.eduTutorProfile.update).mock.calls[0]?.[0] as {
      data: { verifiedAt: Date | null };
    };
    expect(call.data.verifiedAt).toBeNull();
  });

  it("NEEDS_CHANGES clears verifiedAt and stores tutorMessage", async () => {
    vi.mocked(prisma.eduTutorVerification.create).mockResolvedValue({
      id: "v1",
    } as never);
    await setTutorVerificationStatus({
      tutorId: "t1",
      reviewerId: "a1",
      status: "NEEDS_CHANGES",
      tutorMessage: "Please add a current ID photo.",
    });
    const profileCall = vi.mocked(prisma.eduTutorProfile.update).mock.calls[0]?.[0] as {
      data: { verifiedAt: Date | null };
    };
    expect(profileCall.data.verifiedAt).toBeNull();
    const verifyCall = vi.mocked(prisma.eduTutorVerification.create).mock.calls[0]?.[0] as {
      data: { tutorMessage: string };
    };
    expect(verifyCall.data.tutorMessage).toMatch(/ID photo/);
  });
});

describe("unverifiedTutorsExcluded env flag", () => {
  it("default behavior includes unverified tutors", () => {
    expect(unverifiedTutorsExcluded()).toBe(false);
  });

  it("EDUMATCH_REQUIRE_VERIFIED_TUTORS=1 excludes them", () => {
    vi.stubEnv("EDUMATCH_REQUIRE_VERIFIED_TUTORS", "1");
    expect(unverifiedTutorsExcluded()).toBe(true);
  });
});
