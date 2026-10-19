import { useState, useCallback } from 'react';
import { Geolocation } from '@capacitor/geolocation';
import { reverseGeocodeGps } from '../api/geocodingApi';
import { useAppStore } from '../store/useAppStore';

export function useGeolocation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setSelectedLocation = useAppStore((state) => state.setSelectedLocation);

  const getCurrentLocation = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      let lat: number;
      let lon: number;

      try {
        // Try Capacitor native geolocation first
        const permission = await Geolocation.checkPermissions();
        if (permission.location !== 'granted') {
          const req = await Geolocation.requestPermissions();
          if (req.location !== 'granted') {
            throw new Error('Permessi di localizzazione non concessi');
          }
        }
        const coordinates = await Geolocation.getCurrentPosition({
          enableHighAccuracy: true,
          timeout: 10000,
        });
        lat = coordinates.coords.latitude;
        lon = coordinates.coords.longitude;
      } catch (nativeErr) {
        // Fallback to browser navigator.geolocation
        if (!('geolocation' in navigator)) {
          throw new Error('Geolocalizzazione non supportata dal dispositivo');
        }

        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
            });
          }
        );
        lat = position.coords.latitude;
        lon = position.coords.longitude;
      }

      // Reverse geocode to get city / locality name
      const location = await reverseGeocodeGps(lat, lon);
      setSelectedLocation(location);
      return location;
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Impossibile rilevare la posizione attuale';
      setError(msg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [setSelectedLocation]);

  return {
    getCurrentLocation,
    isLoading,
    error,
  };
}
