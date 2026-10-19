import type {
  GeocodingResponse,
  Location,
  ReverseGeocodeResult,
} from '../types/weather.types';

const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';
const GEOCODING_SEARCH_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const REVERSE_GEOCODE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

interface NominatimResultItem {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  name?: string;
  address?: {
    road?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    country?: string;
    postcode?: string;
  };
}

export async function searchLocations(query: string): Promise<Location[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) return [];

  const openMeteoParams = new URLSearchParams({
    name: trimmed,
    count: '6',
    language: 'it',
    format: 'json',
  });

  const nominatimParams = new URLSearchParams({
    q: trimmed,
    format: 'json',
    addressdetails: '1',
    limit: '6',
    countrycodes: 'it,ch',
  });

  const [openMeteoRes, nominatimRes] = await Promise.allSettled([
    fetch(`${GEOCODING_SEARCH_URL}?${openMeteoParams.toString()}`).then((r) =>
      r.ok ? (r.json() as Promise<GeocodingResponse>) : null
    ),
    fetch(`${NOMINATIM_SEARCH_URL}?${nominatimParams.toString()}`, {
      headers: { 'User-Agent': 'AlPiofWeatherApp/1.0' },
    }).then((r) => (r.ok ? (r.json() as Promise<NominatimResultItem[]>) : null)),
  ]);

  const results: Location[] = [];
  const seenCoordinates = new Set<string>();

  // 1. Risultati comunali Open-Meteo (priorità per nomi di città/paesi con altitudine/popolazione)
  if (
    openMeteoRes.status === 'fulfilled' &&
    openMeteoRes.value &&
    openMeteoRes.value.results
  ) {
    for (const item of openMeteoRes.value.results) {
      const coordKey = `${item.latitude.toFixed(2)}_${item.longitude.toFixed(2)}`;
      seenCoordinates.add(coordKey);

      results.push({
        id: `${item.latitude.toFixed(4)}_${item.longitude.toFixed(4)}_${item.name}`,
        name: item.name,
        country: item.country,
        admin1: item.admin1,
        admin2: item.admin2,
        population: item.population,
        latitude: item.latitude,
        longitude: item.longitude,
        elevation: item.elevation,
      });
    }
  }

  // 2. Risultati vie, quartieri, piazze e punti di interesse da OpenStreetMap Nominatim
  if (
    nominatimRes.status === 'fulfilled' &&
    Array.isArray(nominatimRes.value)
  ) {
    for (const item of nominatimRes.value) {
      const lat = parseFloat(item.lat);
      const lon = parseFloat(item.lon);
      if (isNaN(lat) || isNaN(lon)) continue;

      const coordKey = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
      if (seenCoordinates.has(coordKey)) continue;
      seenCoordinates.add(coordKey);

      const a = item.address || {};
      const city =
        a.city || a.town || a.village || a.municipality || '';
      const street = a.road || '';
      const quarter = a.suburb || a.neighbourhood || '';

      let formattedName = item.name || '';
      if (street) {
        formattedName = `${street}${
          quarter ? ` (${quarter})` : city ? ` (${city})` : ''
        }`;
      } else if (quarter && city && quarter !== city) {
        formattedName = `${quarter} (${city})`;
      } else if (!formattedName && city) {
        formattedName = city;
      } else if (!formattedName) {
        formattedName = item.display_name.split(',')[0];
      }

      results.push({
        id: `${lat.toFixed(4)}_${lon.toFixed(4)}_${formattedName}`,
        name: formattedName,
        country: a.country || 'Italia',
        admin1: a.state || '',
        admin2: a.county || city || '',
        latitude: lat,
        longitude: lon,
      });
    }
  }

  return results;
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
