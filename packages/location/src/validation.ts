/**
 * Zod validation schemas for @asafarim/location
 */

import { z } from "zod";
import type { LocationType, LocationSource } from "./types";

// Location type enum
export const LocationTypeSchema = z.enum([
  "home",
  "work", 
  "billing",
  "shipping",
  "other",
] as const satisfies readonly LocationType[]);

// Location source enum
export const LocationSourceSchema = z.enum([
  "manual",
  "browser",
  "geocoded",
  "ip",
] as const satisfies readonly LocationSource[]);

// ISO 3166-1 alpha-2 country code validation
export const CountryCodeSchema = z
  .string()
  .length(2)
  .regex(/^[A-Z]{2}$/, "Must be a valid 2-letter country code (e.g., US, NL)")
  .transform((c: string) => c.toUpperCase());

// Latitude/Longitude validation
export const LatitudeSchema = z
  .number()
  .min(-90)
  .max(90)
  .describe("Latitude in decimal degrees (-90 to 90)");

export const LongitudeSchema = z
  .number()
  .min(-180)
  .max(180)
  .describe("Longitude in decimal degrees (-180 to 180)");

export const GeoPointSchema = z.object({
  lat: LatitudeSchema,
  lng: LongitudeSchema,
  accuracy: z.number().positive().optional(),
});

// Address validation
export const AddressComponentsSchema = z.object({
  formatted: z.string().min(1).max(500).optional(),
  street1: z.string().min(1).max(200).optional(),
  street2: z.string().max(200).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  postalCode: z.string().min(1).max(20).optional(),
  country: CountryCodeSchema.optional(),
  countryName: z.string().min(1).max(100).optional(),
});

// Full location validation for creation
export const CreateLocationSchema = AddressComponentsSchema.extend({
  type: LocationTypeSchema.default("home"),
  label: z.string().min(1).max(50).optional(),
  lat: LatitudeSchema.optional(),
  lng: LongitudeSchema.optional(),
  accuracy: z.number().positive().optional(),
  timezone: z.string().max(50).optional(),
  isPrimary: z.boolean().default(false),
  source: LocationSourceSchema.default("manual"),
  appScope: z.array(z.string().min(1)).default([]),
});

// Update location schema (all fields optional except id)
export const UpdateLocationSchema = z.object({
  id: z.string().cuid(),
  type: LocationTypeSchema.optional(),
  label: z.string().min(1).max(50).optional(),
  formatted: z.string().min(1).max(500).optional(),
  street1: z.string().min(1).max(200).optional(),
  street2: z.string().max(200).optional().nullable(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  postalCode: z.string().min(1).max(20).optional(),
  country: CountryCodeSchema.optional().nullable(),
  countryName: z.string().min(1).max(100).optional().nullable(),
  lat: LatitudeSchema.optional().nullable(),
  lng: LongitudeSchema.optional().nullable(),
  accuracy: z.number().positive().optional().nullable(),
  timezone: z.string().max(50).optional().nullable(),
  isPrimary: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  source: LocationSourceSchema.optional(),
  appScope: z.array(z.string().min(1)).optional(),
});

// Registration location (simplified - minimal required fields)
export const RegistrationLocationSchema = z.object({
  type: LocationTypeSchema.default("home"),
  formatted: z.string().min(1).max(500).optional(),
  street1: z.string().min(1).max(200).optional(),
  city: z.string().min(1).max(100).optional(),
  state: z.string().min(1).max(100).optional(),
  postalCode: z.string().min(1).max(20).optional(),
  country: CountryCodeSchema.optional(),
  lat: LatitudeSchema.optional(),
  lng: LongitudeSchema.optional(),
  source: LocationSourceSchema.default("manual"),
});

// Geocoding request
export const GeocodeRequestSchema = z.object({
  address: z.string().min(1).max(500),
  countryBias: CountryCodeSchema.optional(),
});

// Reverse geocoding request
export const ReverseGeocodeRequestSchema = z.object({
  lat: LatitudeSchema,
  lng: LongitudeSchema,
});

// Distance calculation request
export const DistanceRequestSchema = z.object({
  from: GeoPointSchema,
  to: GeoPointSchema,
  unit: z.enum(["km", "mi", "m", "ft"]).default("km"),
  precision: z.number().int().min(0).max(10).default(2),
});

// Location search/filter
export const LocationSearchSchema = z.object({
  type: LocationTypeSchema.optional(),
  appScope: z.string().min(1).optional(),
  country: CountryCodeSchema.optional(),
  city: z.string().min(1).max(100).optional(),
  near: z.object({
    lat: LatitudeSchema,
    lng: LongitudeSchema,
    radiusKm: z.number().positive().max(1000).default(50),
  }).optional(),
  isPrimary: z.boolean().optional(),
  limit: z.number().int().min(1).max(100).default(50),
});

// Schema-inferred types (use these if you need Zod-validated types)
// Note: Runtime validation types - use types.ts for the base interfaces
export type CreateLocationSchemaType = z.infer<typeof CreateLocationSchema>;
export type UpdateLocationSchemaType = z.infer<typeof UpdateLocationSchema>;
export type RegistrationLocationSchemaType = z.infer<typeof RegistrationLocationSchema>;
export type GeocodeRequestSchemaType = z.infer<typeof GeocodeRequestSchema>;
export type ReverseGeocodeSchemaType = z.infer<typeof ReverseGeocodeRequestSchema>;
export type DistanceRequestSchemaType = z.infer<typeof DistanceRequestSchema>;
export type LocationSearchSchemaType = z.infer<typeof LocationSearchSchema>;
