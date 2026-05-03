/**
 * Location types for @asafarim/location
 * Reusable across all apps in the monorepo
 */

export type LocationType = "home" | "work" | "billing" | "shipping" | "other";
export type LocationSource = "manual" | "browser" | "geocoded" | "ip";

export interface GeoPoint {
  lat: number;
  lng: number;
  accuracy?: number; // GPS accuracy in meters
}

export interface AddressComponents {
  formatted?: string;   // Full formatted address
  street1?: string;     // Street address line 1
  street2?: string;     // Street address line 2 (apartment, suite, etc.)
  city?: string;
  state?: string;       // State/Province/Region
  postalCode?: string;
  country?: string;     // ISO 3166-1 alpha-2 (e.g., "US", "NL")
  countryName?: string; // Full country name
}

export interface UserLocation {
  id: string;
  userId: string;
  type: LocationType;
  label?: string | null;
  
  // Address
  formatted?: string | null;
  street1?: string | null;
  street2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  countryName?: string | null;
  
  // Geolocation
  lat?: number | null;
  lng?: number | null;
  accuracy?: number | null;
  
  // Metadata
  timezone?: string | null;
  isPrimary: boolean;
  isVerified: boolean;
  source: LocationSource;
  appScope: string[];
  
  createdAt: Date | string;
  updatedAt: Date | string;
}

// Input types for creating/updating locations
export interface CreateLocationInput extends AddressComponents {
  type?: LocationType;
  label?: string;
  lat?: number;
  lng?: number;
  accuracy?: number;
  timezone?: string;
  isPrimary?: boolean;
  isVerified?: boolean;
  source?: LocationSource;
  appScope?: string[];
}

export interface UpdateLocationInput {
  id: string;
  type?: LocationType;
  label?: string | null;
  formatted?: string | null;
  street1?: string | null;
  street2?: string | null;
  city?: string | null;
  state?: string | null;
  postalCode?: string | null;
  country?: string | null;
  countryName?: string | null;
  lat?: number | null;
  lng?: number | null;
  accuracy?: number | null;
  timezone?: string | null;
  isPrimary?: boolean;
  isVerified?: boolean;
  source?: LocationSource;
  appScope?: string[];
}

// Registration location input (simplified)
export interface RegistrationLocationInput {
  type?: LocationType;
  formatted?: string;
  street1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  lat?: number;
  lng?: number;
  source?: LocationSource;
}

// Geocoding result
export interface GeocodingResult {
  success: true;
  address: AddressComponents;
  location: GeoPoint;
  timezone?: string;
  raw?: unknown; // Provider-specific raw response
}

export interface GeocodingError {
  success: false;
  error: string;
  code?: string;
}

export type GeocodingResponse = GeocodingResult | GeocodingError;

// Distance calculation options
export interface DistanceOptions {
  unit?: "km" | "mi" | "m" | "ft";
  precision?: number; // Decimal places
}

export interface DistanceResult {
  distance: number;     // Distance in requested unit
  unit: "km" | "mi" | "m" | "ft";
  rawMeters: number;  // Original calculation in meters
}

// Location with distance (for search results)
export interface LocationWithDistance extends UserLocation {
  distanceKm: number;
  distanceMi: number;
}

// Search/filter options
export interface LocationSearchOptions {
  type?: LocationType;
  appScope?: string;
  country?: string;
  city?: string;
  near?: GeoPoint & { radiusKm: number };
  isPrimary?: boolean;
  limit?: number;
}
