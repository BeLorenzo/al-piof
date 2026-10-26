import { useState, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Geolocation } from '@capacitor/geolocation';
import { reverseGeocodeGps } from '../api/geocodingApi';
import { useAppStore } from '../store/useAppStore';
import type { Location } from '../types/weather.types';

function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function useGeolocation() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setSelectedLocation = useAppStore((state) => state.setSelectedLocation);
  const queryClient = useQueryClient();

  const getCurrentLocation = useCallback(
    async (options?: { silent?: boolean }): Promise<Location | null> => {
      const silent = options?.silent ?? false;
      if (!silent) {
        setIsLoading(true);
        setError(null);
      }

      try {
        let lat: number;
        let lon: number;

        try {
          // Try Capacitor native geolocation first
          const permission = await Geolocation.checkPermissions();
          if (permission.location !== 'granted') {
            if (silent) {
              return null;
            }
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

        const currentSelected = useAppStore.getState().selectedLocation;

        // In auto-refresh silenzioso, se eravamo già in modalità GPS e ci siamo spostati
        // di meno di 450m (~0.45km), manteniamo la località corrente senza chiamate ridondanti
        if (silent && currentSelected.isCurrentLocation) {
          const distKm = calculateDistanceKm(
            currentSelected.latitude,
            currentSelected.longitude,
            lat,
            lon
          );
          if (distKm < 0.45) {
            return currentSelected;
          }
        }

        // Reverse geocode to get city / locality name for the new coordinates
        const location = await reverseGeocodeGps(lat, lon);
        location.isCurrentLocation = true;
        setSelectedLocation(location);
        if (!silent) {
          queryClient.invalidateQueries({ queryKey: ['weather-raw'] });
        }
        return location;
      } catch (err: unknown) {
        const msg =
          err instanceof Error
            ? err.message
            : 'Impossibile rilevare la posizione attuale';
        if (!silent) {
          setError(msg);
        }
        return null;
      } finally {
        if (!silent) {
          setIsLoading(false);
        }
      }
    },
    [setSelectedLocation, queryClient]
  );

  return {
    getCurrentLocation,
    isLoading,
    error,
  };
}
