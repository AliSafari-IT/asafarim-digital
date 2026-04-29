/**
 * Phase 3 — Tutor matching with PostGIS spatial queries.
 *
 * Core capabilities:
 * - Find tutors within radius using `ST_DWithin` on `homeLocation`
 * - Match by subject expertise, grade level, and availability
 * - Score and rank tutors by composite algorithm
 */

import { prisma } from "@asafarim/db";
import type { GeoPoint } from "./geocoding";

export type AvailabilitySlot = {
  start: string; // ISO datetime
  end: string;
  mode: "ONLINE" | "IN_PERSON";
};

export type TutorMatchInput = {
  studentLocation: GeoPoint;
  subject: string;
  gradeLevel: string;
  maxDistanceKm?: number;
  preferOnline?: boolean;
  limit?: number;
};

export type ScoredTutor = {
  userId: string;
  bio: string | null;
  subjectsTaught: string[];
  levelsTaught: string[];
  hourlyRateCents: number;
  onlineOnly: boolean;
  serviceRadiusKm: number;
  ratingAvg: number;
  ratingCount: number;
  verifiedAt: Date | null;
  // Computed match scores
  distanceKm: number;
  subjectMatch: boolean;
  levelMatch: boolean;
  availabilityScore: number;
  compositeScore: number;
};

/**
 * Find tutors within the specified radius using PostGIS ST_DWithin.
 * Requires `homeLocation` to be populated (geography(Point, 4326)).
 *
 * Note: The first migration must `CREATE EXTENSION IF NOT EXISTS postgis;`
 */
export async function findNearbyTutors(
  input: TutorMatchInput,
): Promise<ScoredTutor[]> {
  const { studentLocation, maxDistanceKm = 50, limit = 20 } = input;

  // PostGIS ST_DWithin uses meters; convert km to meters
  const distanceMeters = maxDistanceKm * 1000;

  // Raw query with PostGIS geography operators
  // Uses index on homeLocation if available
  const results = await prisma.$queryRaw<Array<{
    userId: string;
    bio: string | null;
    subjectsTaught: string[];
    levelsTaught: string[];
    hourlyRateCents: number;
    onlineOnly: boolean;
    serviceRadiusKm: number;
    ratingAvg: number;
    ratingCount: number;
    verifiedAt: Date | null;
    distanceMeters: number;
  }>>`
    SELECT
      tp."userId",
      tp.bio,
      tp."subjectsTaught",
      tp."levelsTaught",
      tp."hourlyRateCents",
      tp."onlineOnly",
      tp."serviceRadiusKm",
      tp."ratingAvg",
      tp."ratingCount",
      tp."verifiedAt",
      ST_Distance(
        tp."homeLocation"::geography,
        ST_SetSRID(ST_MakePoint(${studentLocation.lng}, ${studentLocation.lat}), 4326)::geography
      ) AS "distanceMeters"
    FROM "EduTutorProfile" tp
    WHERE tp."homeLocation" IS NOT NULL
      AND ST_DWithin(
        tp."homeLocation"::geography,
        ST_SetSRID(ST_MakePoint(${studentLocation.lng}, ${studentLocation.lat}), 4326)::geography,
        ${distanceMeters}
      )
      AND tp."serviceRadiusKm" >= ${maxDistanceKm}
    ORDER BY "distanceMeters" ASC
    LIMIT ${limit}
  `;

  return results.map((r) => ({
    userId: r.userId,
    bio: r.bio,
    subjectsTaught: r.subjectsTaught,
    levelsTaught: r.levelsTaught,
    hourlyRateCents: r.hourlyRateCents,
    onlineOnly: r.onlineOnly,
    serviceRadiusKm: r.serviceRadiusKm,
    ratingAvg: r.ratingAvg,
    ratingCount: r.ratingCount,
    verifiedAt: r.verifiedAt,
    distanceKm: Math.round((r.distanceMeters / 1000) * 10) / 10,
    subjectMatch: false, // computed below
    levelMatch: false,
    availabilityScore: 0,
    compositeScore: 0,
  }));
}

/**
 * Score tutors by composite algorithm.
 * Factors:
 * - Proximity (closer = higher score)
 * - Subject expertise (exact match vs partial)
 * - Grade level match
 * - Rating (higher is better)
 * - Verification status (verified tutors get bonus)
 * - Hourly rate (optional: prefer mid-range)
 */
export function scoreTutors(
  tutors: ScoredTutor[],
  subject: string,
  gradeLevel: string,
  preferOnline: boolean = false,
): ScoredTutor[] {
  return tutors
    .map((t) => {
      // Subject match (case-insensitive partial match)
      const subjectMatch = t.subjectsTaught.some(
        (s) => s.toLowerCase() === subject.toLowerCase() || s.toLowerCase().includes(subject.toLowerCase()),
      );

      // Level match
      const levelMatch = t.levelsTaught.some(
        (l) => l.toLowerCase() === gradeLevel.toLowerCase(),
      );

      // Online preference match
      // If preferOnline=true, only match online-only tutors
      // If preferOnline=false, accept any tutor
      const onlineMatch = preferOnline ? t.onlineOnly : true;

      // Scoring weights (tune based on business priorities)
      const distanceScore = Math.max(0, 50 - t.distanceKm) / 50; // 0-1, closer is better
      const subjectScore = subjectMatch ? 1 : 0.3; // Partial credit for tutors who might be able to help
      const levelScore = levelMatch ? 1 : 0.5;
      const ratingScore = Math.min(t.ratingAvg / 5, 1); // Normalize 0-5 to 0-1
      const verifiedScore = t.verifiedAt ? 0.2 : 0;

      // Composite: weighted sum (all factors 0-1)
      const compositeScore =
        distanceScore * 0.3 +
        subjectScore * 0.25 +
        levelScore * 0.15 +
        ratingScore * 0.2 +
        verifiedScore * 0.1;

      // Availability score for transparency
      const availabilityScore = onlineMatch ? 1 : 0.5;

      // Final score includes availability penalty
      const finalScore = onlineMatch ? compositeScore : compositeScore * 0.5;

      return {
        ...t,
        subjectMatch,
        levelMatch,
        availabilityScore,
        compositeScore: Math.round(finalScore * 1000) / 1000,
      };
    })
    .sort((a, b) => b.compositeScore - a.compositeScore);
}

/**
 * Get best matching tutors for an inquiry.
 * Combines spatial query with scoring algorithm.
 */
export async function findBestTutors(
  input: TutorMatchInput,
): Promise<ScoredTutor[]> {
  const nearby = await findNearbyTutors(input);
  return scoreTutors(nearby, input.subject, input.gradeLevel, input.preferOnline);
}

/**
 * Check if a tutor can service a specific location.
 * Verifies the tutor's service radius covers the point.
 */
export async function canTutorServiceLocation(
  tutorId: string,
  location: GeoPoint,
): Promise<boolean> {
  const result = await prisma.$queryRaw<{ withinRadius: boolean }[]>`
    SELECT ST_DWithin(
      tp."homeLocation"::geography,
      ST_SetSRID(ST_MakePoint(${location.lng}, ${location.lat}), 4326)::geography,
      tp."serviceRadiusKm" * 1000
    ) AS "withinRadius"
    FROM "EduTutorProfile" tp
    WHERE tp."userId" = ${tutorId}
      AND tp."homeLocation" IS NOT NULL
    LIMIT 1
  `;

  return result[0]?.withinRadius ?? false;
}

/**
 * Update tutor home location with geocoded coordinates.
 * Call this when a tutor updates their address.
 */
export async function updateTutorLocation(
  tutorId: string,
  location: GeoPoint,
): Promise<void> {
  await prisma.$executeRaw`
    UPDATE "EduTutorProfile"
    SET "homeLocation" = ST_SetSRID(ST_MakePoint(${location.lng}, ${location.lat}), 4326)
    WHERE "userId" = ${tutorId}
  `;
}
