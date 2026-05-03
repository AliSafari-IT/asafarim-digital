/**
 * @asafarim/location - Reusable location utilities for ASafariM Digital
 * 
 * Features:
 * - Type-safe location types and validation (Zod schemas)
 * - Haversine distance calculations
 * - Prisma service functions for CRUD operations
 * - Geocoding utilities (browser + server-side)
 * 
 * Usage:
 * ```ts
 * import { 
 *   CreateLocationSchema, 
 *   calculateDistance, 
 *   createLocation,
 *   type UserLocation 
 * } from "@asafarim/location";
 * ```
 */

// Types
export * from "./types";

// Validation schemas
export * from "./validation";

// Utilities (distance, formatting, etc.)
export * from "./utils";

// Service (Prisma operations)
export * from "./service";
