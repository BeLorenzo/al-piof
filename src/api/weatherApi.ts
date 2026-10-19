import type {
  OpenMeteoForecastResponse,
  WeatherModel,
} from '../types/weather.types';

const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export async function fetchForecast(
  latitude: number,
  longitude: number,
  model: WeatherModel = 'best_match'
): Promise<OpenMeteoForecastResponse> {
  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    models: model,
    timezone: 'auto',
    forecast_days: '7',
    current: [
      'temperature_2m',
      'relative_humidity_2m',
      'apparent_temperature',
      'is_day',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'surface_pressure',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'dew_point_2m',
    ].join(','),
    minutely_15: 'precipitation',
    hourly: [
      'temperature_2m',
      'apparent_temperature',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'cloud_cover',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'uv_index',
      'freezing_level_height',
      'relative_humidity_2m',
      'visibility',
      'dew_point_2m',
      'surface_pressure',
    ].join(','),
    daily: [
      'weather_code',
      'temperature_2m_max',
      'temperature_2m_min',
      'apparent_temperature_max',
      'apparent_temperature_min',
      'sunrise',
      'sunset',
      'uv_index_max',
      'precipitation_sum',
      'precipitation_probability_max',
      'wind_speed_10m_max',
      'wind_gusts_10m_max',
    ].join(','),
  });

  const response = await fetch(`${OPEN_METEO_FORECAST_URL}?${params.toString()}`);

  if (!response.ok) {
    throw new Error(
      `Errore nel recupero delle previsioni meteo: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export interface RawModelComparisonsResponse {
  hourly?: {
    time: string[];
    temperature_2m_meteoswiss_icon_ch2?: number[];
    temperature_2m_ecmwf_ifs025?: number[];
    temperature_2m_icon_d2?: number[];
    precipitation_meteoswiss_icon_ch2?: number[];
    precipitation_ecmwf_ifs025?: number[];
    precipitation_icon_d2?: number[];
    [key: string]: any;
  };
  daily?: {
    time: string[];
    temperature_2m_max_meteoswiss_icon_ch2?: number[];
    temperature_2m_max_ecmwf_ifs025?: number[];
    temperature_2m_max_icon_d2?: number[];
    temperature_2m_min_meteoswiss_icon_ch2?: number[];
    temperature_2m_min_ecmwf_ifs025?: number[];
    temperature_2m_min_icon_d2?: number[];
    precipitation_sum_meteoswiss_icon_ch2?: number[];
    precipitation_sum_ecmwf_ifs025?: number[];
    precipitation_sum_icon_d2?: number[];
    [key: string]: any;
  };
}

export async function fetchModelComparisons(
  latitude: number,
  longitude: number
): Promise<RawModelComparisonsResponse | null> {
  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      models: 'meteoswiss_icon_ch2,ecmwf_ifs025,icon_d2',
      timezone: 'auto',
      forecast_days: '7',
      hourly: 'temperature_2m,precipitation',
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
    });

    const response = await fetch(`${OPEN_METEO_FORECAST_URL}?${params.toString()}`);
    if (!response.ok) {
      console.warn('Impossibile scaricare confronto modelli:', response.status);
      return null;
    }
    return await response.json();
  } catch (err) {
    console.warn('Errore di rete durante il confronto modelli:', err);
    return null;
  }
}

