/**
 * React hook for browser geolocation API
 * Works in any React app in the monorepo
 */

import { useState, useCallback, useEffect, useRef } from "react";
import type { GeoPoint } from "./types";

interface GeolocationState {
  location: GeoPoint | null;
  accuracy: number | null;
  loading: boolean;
  error: string | null;
  supported: boolean;
}

interface GeolocationOptions {
  enableHighAccuracy?: boolean;
  timeout?: number;
  maximumAge?: number;
}

export function useGeolocation(options: GeolocationOptions = {}) {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    accuracy: null,
    loading: false,
    error: null,
    supported: typeof navigator !== "undefined" && "geolocation" in navigator,
  });

  const watchIdRef = useRef<number | null>(null);

  /**
   * Request current position (one-time)
   */
  const requestLocation = useCallback(async (): Promise<GeoPoint | null> => {
    if (!state.supported) {
      setState((s: GeolocationState) => ({ ...s, error: "Geolocation is not supported by your browser" }));
      return null;
    }

    setState((s: GeolocationState) => ({ ...s, loading: true, error: null }));

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const loc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setState({
            location: loc,
            accuracy: position.coords.accuracy,
            loading: false,
            error: null,
            supported: true,
          });
          resolve(loc);
        },
        (err: GeolocationPositionError) => {
          const message = getGeolocationErrorMessage(err);
          setState((s: GeolocationState) => ({ ...s, loading: false, error: message }));
          resolve(null);
        },
        {
          enableHighAccuracy: options.enableHighAccuracy ?? true,
          timeout: options.timeout ?? 10000,
          maximumAge: options.maximumAge ?? 0,
        }
      );
    });
  }, [state.supported, options]);

  /**
   * Start watching position
   */
  const startWatching = useCallback(() => {
    if (!state.supported) return;

    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    setState((s: GeolocationState) => ({ ...s, loading: true, error: null }));

    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          accuracy: position.coords.accuracy,
          loading: false,
          error: null,
          supported: true,
        });
      },
      (err) => {
        setState((s: GeolocationState) => ({
          ...s,
          loading: false,
          error: getGeolocationErrorMessage(err),
        }));
      },
      {
        enableHighAccuracy: options.enableHighAccuracy ?? true,
        timeout: options.timeout ?? 10000,
        maximumAge: options.maximumAge ?? 10000,
      }
    );
  }, [state.supported, options]);

  /**
   * Stop watching position
   */
  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  /**
   * Clear any error
   */
  const clearError = useCallback(() => {
    setState((s: GeolocationState) => ({ ...s, error: null }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return {
    ...state,
    requestLocation,
    startWatching,
    stopWatching,
    clearError,
  };
}

function getGeolocationErrorMessage(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return "Location access was denied. Please enable location permissions in your browser.";
    case error.POSITION_UNAVAILABLE:
      return "Location information is unavailable.";
    case error.TIMEOUT:
      return "The request to get your location timed out.";
    default:
      return "An unknown error occurred while getting your location.";
  }
}

/**
 * Hook to fetch address from coordinates (reverse geocoding)
 * Uses OpenStreetMap Nominatim by default (free, no API key required)
 */
interface ReverseGeocodeResult {
  formatted: string;
  street1?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  countryName?: string;
}

export function useReverseGeocode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const reverseGeocode = useCallback(async (
    lat: number,
    lng: number,
    signal?: AbortSignal
  ): Promise<ReverseGeocodeResult | null> => {
    setLoading(true);
    setError(null);

    try {
      // Using OpenStreetMap Nominatim (free, but rate-limited)
      // For production with high volume, use Google Maps or Mapbox
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        { signal }
      );

      if (!response.ok) {
        throw new Error(`Geocoding failed: ${response.status}`);
      }

      const data = await response.json();

      if (!data || !data.address) {
        return null;
      }

      const addr = data.address;

      return {
        formatted: data.display_name,
        street1: formatStreetAddress(addr),
        city: addr.city || addr.town || addr.village || addr.municipality,
        state: addr.state || addr.province || addr.region,
        postalCode: addr.postcode,
        country: addr.country_code?.toUpperCase(),
        countryName: addr.country,
      };
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return null;
      }
      setError(err instanceof Error ? err.message : "Reverse geocoding failed");
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return { reverseGeocode, loading, error, clearError: () => setError(null) };
}

function formatStreetAddress(addr: Record<string, string>): string | undefined {
  const parts = [
    addr.house_number,
    addr.road || addr.street || addr.pedestrian,
  ].filter(Boolean);
  
  if (parts.length === 0) return undefined;
  return parts.join(" ");
}
