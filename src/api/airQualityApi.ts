import type { OpenMeteoAirQualityResponse } from '../types/weather.types';

const OPEN_METEO_AIR_QUALITY_URL = 'https://air-quality-api.open-meteo.com/v1/air-quality';

export async function fetchAirQuality(
  latitude: number,
  longitude: number
): Promise<OpenMeteoAirQualityResponse> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    timezone: 'auto',
    forecast_days: '5',
    current: [
      'european_aqi',
      'pm10',
      'pm2_5',
      'nitrogen_dioxide',
      'ozone',
      'alder_pollen',
      'birch_pollen',
      'grass_pollen',
      'mugwort_pollen',
      'olive_pollen',
      'ragweed_pollen',
    ].join(','),
    hourly: ['european_aqi', 'pm10', 'pm2_5'].join(','),
  });

  const response = await fetch(`${OPEN_METEO_AIR_QUALITY_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(
      `Errore nel recupero della qualità dell'aria: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}
