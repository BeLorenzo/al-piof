import type {
  GeocodingResponse,
  Location,
  ReverseGeocodeResult,
} from '../types/weather.types';

const GEOCODING_SEARCH_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const REVERSE_GEOCODE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

export async function searchLocations(query: string): Promise<Location[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const params = new URLSearchParams({
    name: trimmed,
    count: '10',
    language: 'it',
    format: 'json',
  });

  const response = await fetch(`${GEOCODING_SEARCH_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Errore ricerca località: ${response.statusText}`);
  }

  const data: GeocodingResponse = await response.json();
  if (!data.results) return [];

  return data.results.map((item) => ({
    id: `${item.latitude.toFixed(4)}_${item.longitude.toFixed(4)}_${item.name}`,
    name: item.name,
    country: item.country,
    admin1: item.admin1,
    latitude: item.latitude,
    longitude: item.longitude,
    elevation: item.elevation,
  }));
}

export async function reverseGeocodeGps(
  latitude: number,
  longitude: number
): Promise<Location> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    localityLanguage: 'it',
  });

  const response = await fetch(`${REVERSE_GEOCODE_URL}?${params.toString()}`);
  if (!response.ok) {
    throw new Error(`Errore reverse geocoding: ${response.statusText}`);
  }

  const data: ReverseGeocodeResult = await response.json();
  const name =
    data.locality ||
    data.city ||
    data.principalSubdivision ||
    'Posizione attuale';

  return {
    id: `gps_${latitude.toFixed(4)}_${longitude.toFixed(4)}`,
    name,
    admin1: data.principalSubdivision,
    country: data.countryName,
    latitude,
    longitude,
    isCurrentLocation: true,
  };
}
