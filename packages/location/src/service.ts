/**
 * Location service for @asafarim/location
 * Database operations using Prisma
 * 
 * Pass any PrismaClient instance (from @asafarim/db) to these functions.
 */

import type { PrismaClient } from "@asafarim/db";
import type {
  UserLocation,
  CreateLocationInput,
  UpdateLocationInput,
  LocationSearchOptions,
  GeoPoint,
} from "./types";
import { calculateDistance, isWithinRadius } from "./utils";

// Use the actual Prisma client type
export type DBClient = PrismaClient;

/**
 * Create a new location for a user.
 * If isPrimary=true, automatically unsets other primary locations of the same type.
 */
export async function createLocation(
  db: DBClient,
  userId: string,
  input: CreateLocationInput
): Promise<UserLocation> {
  const type = input.type ?? "home";

  if (input.isPrimary) {
    await db.userLocation.updateMany({
      where: { userId, type, isPrimary: true },
      data: { isPrimary: false },
    });
  }

  const location = await db.userLocation.create({
    data: {
      userId,
      type,
      label: input.label ?? null,
      formatted: input.formatted ?? null,
      street1: input.street1 ?? null,
      street2: input.street2 ?? null,
      city: input.city ?? null,
      state: input.state ?? null,
      postalCode: input.postalCode ?? null,
      country: input.country ?? null,
      countryName: input.countryName ?? null,
      lat: input.lat ?? null,
      lng: input.lng ?? null,
      accuracy: input.accuracy ?? null,
      timezone: input.timezone ?? null,
      isPrimary: input.isPrimary ?? false,
      isVerified: input.isVerified ?? false,
      source: input.source ?? "manual",
      appScope: input.appScope ?? [],
    },
  });

  return location as unknown as UserLocation;
}

/**
 * Update an existing location (user-scoped for security).
 */
export async function updateLocation(
  db: DBClient,
  userId: string,
  input: UpdateLocationInput
): Promise<UserLocation> {
  const { id, ...data } = input;

  const existing = await db.userLocation.findFirst({
    where: { id, userId },
  });
  if (!existing) {
    throw new Error("Location not found or access denied");
  }

  if (data.isPrimary) {
    await db.userLocation.updateMany({
      where: {
        userId,
        type: data.type ?? existing.type,
        isPrimary: true,
        id: { not: id },
      },
      data: { isPrimary: false },
    });
  }

  const updated = await db.userLocation.update({
    where: { id },
    data,
  });

  return updated as unknown as UserLocation;
}

/**
 * Delete a location (user-scoped for security).
 */
export async function deleteLocation(
  db: DBClient,
  userId: string,
  locationId: string
): Promise<void> {
  const result = await db.userLocation.deleteMany({
    where: { id: locationId, userId },
  });

  if (result.count === 0) {
    throw new Error("Location not found or access denied");
  }
}

/**
 * Get a single location by ID (user-scoped).
 */
export async function getLocation(
  db: DBClient,
  userId: string,
  locationId: string
): Promise<UserLocation | null> {
  const location = await db.userLocation.findFirst({
    where: { id: locationId, userId },
  });

  return location as unknown as UserLocation | null;
}

/**
 * Get user's primary location of a specific type (default: home).
 */
export async function getPrimaryLocation(
  db: DBClient,
  userId: string,
  type = "home"
): Promise<UserLocation | null> {
  const location = await db.userLocation.findFirst({
    where: { userId, type, isPrimary: true },
  });

  return location as unknown as UserLocation | null;
}

/**
 * List all locations for a user with optional filtering.
 * Supports radius search (uses Haversine distance, no PostGIS required).
 */
export async function listLocations(
  db: DBClient,
  userId: string,
  options: LocationSearchOptions = {}
): Promise<UserLocation[]> {
  const {
    type,
    appScope,
    country,
    city,
    near,
    isPrimary,
    limit = 50,
  } = options;

  const locations = await db.userLocation.findMany({
    where: {
      userId,
      ...(type && { type }),
      ...(appScope && { appScope: { has: appScope } }),
      ...(country && { country }),
      ...(city && { city: { contains: city, mode: "insensitive" as const } }),
      ...(isPrimary !== undefined && { isPrimary }),
    },
    orderBy: [{ isPrimary: "desc" as const }, { createdAt: "desc" as const }],
    take: limit,
  });

  const typed = locations as unknown as UserLocation[];

  if (near && near.radiusKm > 0) {
    return typed.filter((loc) => {
      if (loc.lat == null || loc.lng == null) return false;
      return isWithinRadius(
        { lat: near.lat, lng: near.lng },
        { lat: loc.lat, lng: loc.lng },
        near.radiusKm
      );
    });
  }

  return typed;
}

/**
 * Find locations near a point (cross-user search).
 * Returns locations with calculated distance, sorted by proximity.
 * 
 * Use with caution - respect user privacy settings via appScope filter.
 */
export async function findNearbyLocations(
  db: DBClient,
  center: GeoPoint,
  radiusKm: number,
  options: {
    type?: string;
    appScope?: string;
    limit?: number;
  } = {}
): Promise<Array<UserLocation & { distanceKm: number }>> {
  const { type, appScope, limit = 50 } = options;

  const candidates = await db.userLocation.findMany({
    where: {
      lat: { not: null },
      lng: { not: null },
      ...(type && { type }),
      ...(appScope && { appScope: { has: appScope } }),
    },
    take: limit * 2,
  });

  return (candidates as unknown as UserLocation[])
    .filter((loc) => loc.lat != null && loc.lng != null)
    .map((loc) => ({
      ...loc,
      distanceKm: calculateDistance(
        center,
        { lat: loc.lat as number, lng: loc.lng as number },
        { unit: "km", precision: 2 }
      ).distance,
    }))
    .filter((loc) => loc.distanceKm <= radiusKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

/**
 * Set a location as primary (unsets others of same type automatically).
 */
export async function setPrimaryLocation(
  db: DBClient,
  userId: string,
  locationId: string
): Promise<UserLocation> {
  const location = await db.userLocation.findFirst({
    where: { id: locationId, userId },
  });

  if (!location) {
    throw new Error("Location not found or access denied");
  }

  await db.userLocation.updateMany({
    where: {
      userId,
      type: location.type,
      isPrimary: true,
      id: { not: locationId },
    },
    data: { isPrimary: false },
  });

  const updated = await db.userLocation.update({
    where: { id: locationId },
    data: { isPrimary: true },
  });

  return updated as unknown as UserLocation;
}

/**
 * Count locations for a user with optional filters.
 */
export async function countLocations(
  db: DBClient,
  userId: string,
  filters: {
    type?: string;
    appScope?: string;
    country?: string;
  } = {}
): Promise<number> {
  const { type, appScope, country } = filters;

  return db.userLocation.count({
    where: {
      userId,
      ...(type && { type }),
      ...(appScope && { appScope: { has: appScope } }),
      ...(country && { country }),
    },
  });
}
