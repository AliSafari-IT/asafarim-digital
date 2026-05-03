/**
 * Location utilities for @asafarim/location
 * Distance calculations, coordinate math, formatting
 */

import type { GeoPoint, DistanceOptions, DistanceResult } from "./types";

// Earth's radius in different units
const EARTH_RADIUS = {
  km: 6371,
  mi: 3959,
  m: 6_371_000,
  ft: 20_902_000,
} as const;

/**
 * Calculate Haversine distance between two points
 * @returns Distance in the requested unit
 */
export function calculateDistance(
  from: GeoPoint,
  to: GeoPoint,
  options: DistanceOptions = {}
): DistanceResult {
  const { unit = "km", precision = 2 } = options;
  
  const R = EARTH_RADIUS[unit];
  const toRad = Math.PI / 180;
  
  const dLat = (to.lat - from.lat) * toRad;
  const dLng = (to.lng - from.lng) * toRad;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(from.lat * toRad) *
      Math.cos(to.lat * toRad) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const rawMeters = EARTH_RADIUS.m * c;
  const distance = R * c;
  
  // Round to precision
  const factor = Math.pow(10, precision);
  const rounded = Math.round(distance * factor) / factor;
  
  return {
    distance: rounded,
    unit,
    rawMeters,
  };
}

/**
 * Convert distance between units
 */
export function convertDistance(
  value: number,
  from: "km" | "mi" | "m" | "ft",
  to: "km" | "mi" | "m" | "ft"
): number {
  const inMeters = value * EARTH_RADIUS.m / EARTH_RADIUS[from];
  return inMeters * EARTH_RADIUS[to] / EARTH_RADIUS.m;
}

/**
 * Format distance for display
 */
export function formatDistance(
  distance: number,
  unit: "km" | "mi" | "m" | "ft",
  locale = "en-US"
): string {
  const formatter = new Intl.NumberFormat(locale, {
    maximumFractionDigits: unit === "m" || unit === "ft" ? 0 : 1,
  });
  
  const unitLabels: Record<string, string> = {
    km: "km",
    mi: "mi",
    m: "m",
    ft: "ft",
  };
  
  return `${formatter.format(distance)} ${unitLabels[unit]}`;
}

/**
 * Check if a point is within a radius of another point
 */
export function isWithinRadius(
  center: GeoPoint,
  point: GeoPoint,
  radiusKm: number
): boolean {
  const { rawMeters } = calculateDistance(center, point, { unit: "m" });
  return rawMeters <= radiusKm * 1000;
}

/**
 * Format address components into a single line
 */
export function formatAddress(components: {
  street1?: string | null;
  street2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
}): string {
  const parts = [
    components.street1,
    components.street2,
    components.city,
    components.state,
    components.postalCode,
    components.country,
  ].filter(Boolean);
  
  return parts.join(", ");
}

/**
 * Parse a formatted address string into components (best effort)
 * Note: This is a simple parser; for production, use a geocoding service
 */
export function parseAddress(formatted: string): {
  street1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
} {
  const parts = formatted.split(",").map((p) => p.trim());
  
  return {
    street1: parts[0],
    city: parts[1],
    state: parts[2],
    postalCode: parts[3],
    country: parts[4],
  };
}

/**
 * Get timezone from coordinates using browser API (if available)
 * Note: This is a client-side only function
 */
export function getTimezoneFromCoords(lat: number, lng: number): string | null {
  // Intl.DateTimeFormat can guess timezone from coords in modern browsers
  try {
    const formatter = new Intl.DateTimeFormat("en", {
      timeZone: undefined,
      timeZoneName: "short",
    });
    // This returns the system's timezone, not coords-based
    // For coords-based, you'd need a timezone API like Google Time Zone
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return null;
  }
}

/**
 * Get cardinal direction between two points
 */
export function getDirection(from: GeoPoint, to: GeoPoint): string {
  const dLng = to.lng - from.lng;
  const dLat = to.lat - from.lat;
  
  const angle = (Math.atan2(dLng, dLat) * 180) / Math.PI;
  const normalized = (angle + 360) % 360;
  
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(normalized / 45) % 8;
  
  return directions[index];
}

/**
 * Calculate bounding box for a radius search
 * @returns [minLat, maxLat, minLng, maxLng]
 */
export function calculateBoundingBox(
  center: GeoPoint,
  radiusKm: number
): [number, number, number, number] {
  // 1 degree of latitude ≈ 111 km
  const latDelta = radiusKm / 111;
  // 1 degree of longitude varies by latitude
  const lngDelta = radiusKm / (111 * Math.cos((center.lat * Math.PI) / 180));
  
  return [
    center.lat - latDelta,  // minLat
    center.lat + latDelta,  // maxLat
    center.lng - lngDelta,  // minLng
    center.lng + lngDelta,  // maxLng
  ];
}

/**
 * Validate coordinates
 */
export function isValidCoords(lat: number, lng: number): boolean {
  return (
    typeof lat === "number" &&
    typeof lng === "number" &&
    !isNaN(lat) &&
    !isNaN(lng) &&
    lat >= -90 &&
    lat <= 90 &&
    lng >= -180 &&
    lng <= 180
  );
}

/**
 * Round coordinates to reduce precision (privacy)
 * @param precision Decimal places (default 4 = ~11m precision)
 */
export function roundCoords(
  lat: number,
  lng: number,
  precision = 4
): { lat: number; lng: number } {
  const factor = Math.pow(10, precision);
  return {
    lat: Math.round(lat * factor) / factor,
    lng: Math.round(lng * factor) / factor,
  };
}
