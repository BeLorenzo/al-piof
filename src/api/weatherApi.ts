import type {
  OpenMeteoForecastResponse,
  WeatherModel,
} from '../types/weather.types';

const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export const ENSEMBLE_MODELS_PARAM =
  'best_match,meteoswiss_icon_ch2,ecmwf_ifs025,icon_d2';

export async function fetchForecast(
  latitude: number,
  longitude: number,
  model: WeatherModel = 'ensemble'
): Promise<OpenMeteoForecastResponse> {
  const modelsParam =
    model === 'ensemble' ? ENSEMBLE_MODELS_PARAM : model;

  const params = new URLSearchParams({
    latitude: latitude.toString(),
    longitude: longitude.toString(),
    models: modelsParam,
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
