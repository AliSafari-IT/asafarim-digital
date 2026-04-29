/**
 * Phase 3 — Quote request and standardized quote management.
 *
 * - Students request quotes for their inquiries
 * - Matching tutors are notified/invited
 * - Tutors submit standardized quotes with pricing and availability
 * - Students accept/decline quotes
 */

import { prisma } from "@asafarim/db";
import type { AvailabilitySlot } from "./tutor-matching";

export type QuoteRequestInput = {
  inquiryId: string;
  studentId: string;
  expiresInHours?: number;
};

export type QuoteInput = {
  quoteRequestId: string;
  tutorId: string;
  hourlyRateCents: number;
  estimatedHours: number;
  availabilitySlots: AvailabilitySlot[];
  notes?: string;
};

export class QuoteError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "QuoteError";
  }
}

/**
 * Create a quote request for an inquiry.
 * Transitions inquiry status from AI_RESPONDED → TUTOR_REQUESTED.
 */
export async function createQuoteRequest(
  input: QuoteRequestInput,
): Promise<{ id: string; status: string; expiresAt: Date }> {
  const { inquiryId, studentId, expiresInHours = 48 } = input;

  // Verify inquiry exists and belongs to student
  const inquiry = await prisma.eduInquiry.findFirst({
    where: { id: inquiryId, studentId },
    select: { id: true, status: true },
  });
  if (!inquiry) {
    throw new QuoteError("Inquiry not found or access denied.");
  }

  // Can only request quotes if AI has responded or status is still NEW
  if (!["NEW", "AI_RESPONDED"].includes(inquiry.status)) {
    throw new QuoteError(`Cannot request quotes for inquiry with status: ${inquiry.status}`);
  }

  const expiresAt = new Date(Date.now() + (input.expiresInHours ?? 48) * 60 * 60 * 1000);

  // Use transaction to create quote request + update inquiry status
  const result = await prisma.$transaction(async (tx) => {
    const quoteRequest = await tx.eduQuoteRequest.create({
      data: {
        inquiryId: input.inquiryId,
        studentId: input.studentId,
        expiresAt,
        status: "OPEN",
      },
    });

    await tx.eduInquiry.update({
      where: { id: input.inquiryId },
      data: { status: "TUTOR_REQUESTED" },
    });

    return quoteRequest;
  });

  return {
    id: result.id,
    status: result.status,
    expiresAt: result.expiresAt,
  };
}

/**
 * Submit a quote from a tutor.
 * Validates the tutor is eligible to quote on this request.
 */
export async function submitQuote(
  input: QuoteInput,
): Promise<{ id: string; totalCents: number; status: string; eligible: boolean }> {
  // Verify quote request exists and is open
  const quoteRequest = await prisma.eduQuoteRequest.findUnique({
    where: { id: input.quoteRequestId },
    include: { inquiry: { select: { subject: true, gradeLevel: true } } },
  });

  if (!quoteRequest) {
    throw new QuoteError("Quote request not found.");
  }
  if (quoteRequest.status !== "OPEN") {
    throw new QuoteError(`Quote request is ${quoteRequest.status.toLowerCase()}.`);
  }
  if (quoteRequest.expiresAt < new Date()) {
    throw new QuoteError("Quote request has expired.");
  }

  // Verify tutor exists and is active
  const tutor = await prisma.eduTutorProfile.findUnique({
    where: { userId: input.tutorId },
    select: { userId: true, subjectsTaught: true, levelsTaught: true },
  });
  if (!tutor) {
    throw new QuoteError("Tutor profile not found.");
  }

  // Validate tutor can teach this subject/level (soft check, allows override)
  const canTeachSubject = tutor.subjectsTaught.some(
    (s) => s.toLowerCase() === quoteRequest.inquiry.subject.toLowerCase(),
  );
  const canTeachLevel = tutor.levelsTaught.some(
    (l) => l.toLowerCase() === quoteRequest.inquiry.gradeLevel.toLowerCase(),
  );

  // Calculate total
  const totalCents = Math.round(input.hourlyRateCents * input.estimatedHours);

  // Check for existing quote from this tutor
  const existing = await prisma.eduQuote.findUnique({
    where: {
      quoteRequestId_tutorId: {
        quoteRequestId: input.quoteRequestId,
        tutorId: input.tutorId,
      },
    },
  });

  if (existing) {
    throw new QuoteError("You have already submitted a quote for this request.");
  }

  const quote = await prisma.eduQuote.create({
    data: {
      quoteRequestId: input.quoteRequestId,
      tutorId: input.tutorId,
      hourlyRateCents: input.hourlyRateCents,
      estimatedHours: input.estimatedHours,
      totalCents,
      availabilitySlots: input.availabilitySlots as unknown as object,
      notes: input.notes ?? null,
      status: "PENDING",
    },
  });

  return {
    id: quote.id,
    totalCents: quote.totalCents,
    status: quote.status,
    eligible: canTeachSubject && canTeachLevel,
  };
}

/**
 * Student accepts a quote.
 * Creates a booking placeholder and updates statuses.
 */
export async function acceptQuote(
  quoteId: string,
  studentId: string,
): Promise<{ bookingId: string; quoteId: string }> {
  const quote = await prisma.eduQuote.findFirst({
    where: { id: quoteId },
    include: {
      quoteRequest: { select: { studentId: true, inquiryId: true, status: true } },
    },
  });

  if (!quote) {
    throw new QuoteError("Quote not found.");
  }
  if (quote.quoteRequest.studentId !== studentId) {
    throw new QuoteError("Access denied.");
  }
  if (quote.status !== "PENDING") {
    throw new QuoteError(`Quote cannot be accepted (status: ${quote.status}).`);
  }
  if (quote.quoteRequest.status !== "OPEN") {
    throw new QuoteError("Quote request is no longer open.");
  }

  // Transaction: accept quote, decline others, mark request fulfilled, create booking
  const result = await prisma.$transaction(async (tx) => {
    // Accept this quote
    await tx.eduQuote.update({
      where: { id: quoteId },
      data: { status: "ACCEPTED", updatedAt: new Date() },
    });

    // Decline other quotes for this request
    await tx.eduQuote.updateMany({
      where: { quoteRequestId: quote.quoteRequestId, id: { not: quoteId } },
      data: { status: "DECLINED", updatedAt: new Date() },
    });

    // Mark request as fulfilled
    await tx.eduQuoteRequest.update({
      where: { id: quote.quoteRequestId },
      data: { status: "FULFILLED" },
    });

    // Mark inquiry as booked
    await tx.eduInquiry.update({
      where: { id: quote.quoteRequest.inquiryId },
      data: { status: "BOOKED" },
    });

    // Create booking
    const booking = await tx.eduBooking.create({
      data: {
        studentId: quote.quoteRequest.studentId,
        tutorId: quote.tutorId,
        quoteId: quote.id,
        scheduledAt: new Date(), // Placeholder; should use selected slot
        durationMinutes: Math.round(quote.estimatedHours * 60),
        mode: "ONLINE", // Default; could be derived from quote slots
        status: "SCHEDULED",
      },
    });

    return { bookingId: booking.id, quoteId: quote.id };
  });

  return result;
}

/**
 * Student declines a quote.
 */
export async function declineQuote(quoteId: string, studentId: string): Promise<void> {
  const quote = await prisma.eduQuote.findFirst({
    where: { id: quoteId },
    include: { quoteRequest: { select: { studentId: true } } },
  });

  if (!quote) throw new QuoteError("Quote not found.");
  if (quote.quoteRequest.studentId !== studentId) throw new QuoteError("Access denied.");
  if (quote.status !== "PENDING") throw new QuoteError("Quote cannot be declined.");

  await prisma.eduQuote.update({
    where: { id: quoteId },
    data: { status: "DECLINED", updatedAt: new Date() },
  });
}

/**
 * List quotes for a student's quote request.
 */
export async function listQuotesForRequest(
  quoteRequestId: string,
  studentId: string,
) {
  const qr = await prisma.eduQuoteRequest.findFirst({
    where: { id: quoteRequestId, studentId },
    include: {
      quotes: {
        include: {
          tutor: {
            select: {
              id: true,
              name: true,
              image: true,
              eduTutorProfile: {
                select: {
                  bio: true,
                  ratingAvg: true,
                  ratingCount: true,
                  verifiedAt: true,
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!qr) throw new QuoteError("Quote request not found.");
  return qr.quotes;
}

/**
 * List quote requests for a student.
 */
export async function listStudentQuoteRequests(studentId: string) {
  return prisma.eduQuoteRequest.findMany({
    where: { studentId },
    include: {
      inquiry: { select: { subject: true, gradeLevel: true, description: true } },
      quotes: {
        select: { id: true, status: true, totalCents: true, tutorId: true },
      },
    },
    orderBy: { requestedAt: "desc" },
  });
}

/**
 * List available quote requests for a tutor (matching their expertise + location).
 */
export async function listAvailableQuoteRequestsForTutor(
  tutorId: string,
  location: { lat: number; lng: number },
  maxDistanceKm: number = 50,
) {
  const tutor = await prisma.eduTutorProfile.findUnique({
    where: { userId: tutorId },
    select: { subjectsTaught: true, levelsTaught: true, onlineOnly: true },
  });
  if (!tutor) throw new QuoteError("Tutor profile not found.");

  // Find open requests where:
  // 1. Quote request is OPEN and not expired
  // 2. Inquiry subject matches tutor's subjectsTaught (case insensitive)
  // 3. Either online-only tutor OR within service radius

  const distanceMeters = maxDistanceKm * 1000;

  const requests = await prisma.$queryRaw<Array<{
    id: string;
    inquiryId: string;
    subject: string;
    gradeLevel: string;
    description: string;
    requestedAt: Date;
    expiresAt: Date;
    distanceMeters: number;
  }>>`
    SELECT
      qr.id,
      i.id as "inquiryId",
      i.subject,
      i."gradeLevel",
      i.description,
      qr."requestedAt",
      qr."expiresAt",
      ST_Distance(
        ST_SetSRID(ST_MakePoint(${location.lng}, ${location.lat}), 4326)::geography,
        sp."homeLocation"::geography
      ) AS "distanceMeters"
    FROM "EduQuoteRequest" qr
    JOIN "EduInquiry" i ON qr."inquiryId" = i.id
    JOIN "EduStudentProfile" sp ON i."studentId" = sp."userId"
    WHERE qr.status = 'OPEN'
      AND qr."expiresAt" > NOW()
      AND i.subject ILIKE ANY (
        SELECT unnest(${tutor.subjectsTaught}::text[])
      )
      AND (
        ${tutor.onlineOnly} = true
        OR ST_DWithin(
          sp."homeLocation"::geography,
          ST_SetSRID(ST_MakePoint(${location.lng}, ${location.lat}), 4326)::geography,
          ${distanceMeters}
        )
      )
    ORDER BY qr."requestedAt" DESC
    LIMIT 50
  `;

  return requests.map((r) => ({
    ...r,
    distanceKm: Math.round((r.distanceMeters / 1000) * 10) / 10,
  }));
}
