export type WeatherModel =
  | 'best_match'
  | 'meteoswiss_icon_ch2'
  | 'ecmwf_ifs025'
  | 'icon_d2';

export interface WeatherModelOption {
  id: WeatherModel;
  label: string;
  description: string;
}

export interface Location {
  id: string;
  name: string;
  country?: string;
  admin1?: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  isCurrentLocation?: boolean;
}

// --- Raw Open-Meteo Forecast Response ---
export interface OpenMeteoForecastResponse {
  latitude: number;
  longitude: number;
  elevation: number;
  timezone: string;
  timezone_abbreviation: string;
  current?: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    weather_code: number;
    cloud_cover: number;
    surface_pressure: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
  };
  minutely_15?: {
    time: string[];
    precipitation: number[];
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    precipitation_probability: number[];
    precipitation: number[];
    weather_code: number[];
    cloud_cover: number[];
    wind_speed_10m: number[];
    wind_direction_10m: number[];
    wind_gusts_10m: number[];
    uv_index: number[];
    freezing_level_height: number[];
    relative_humidity_2m: number[];
    visibility: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    apparent_temperature_max: number[];
    apparent_temperature_min: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
    precipitation_sum: number[];
    precipitation_probability_max: number[];
    wind_speed_10m_max: number[];
    wind_gusts_10m_max: number[];
  };
}

// --- Raw Open-Meteo Air Quality Response ---
export interface OpenMeteoAirQualityResponse {
  latitude: number;
  longitude: number;
  current?: {
    time: string;
    european_aqi: number;
    pm10: number;
    pm2_5: number;
    nitrogen_dioxide: number;
    ozone: number;
    alder_pollen: number;
    birch_pollen: number;
    grass_pollen: number;
    mugwort_pollen: number;
    olive_pollen: number;
    ragweed_pollen: number;
  };
  hourly?: {
    time: string[];
    european_aqi: number[];
    pm10: number[];
    pm2_5: number[];
  };
}

// --- Geocoding Responses ---
export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  elevation?: number;
  country_code?: string;
  country?: string;
  admin1?: string;
  admin2?: string;
}

export interface GeocodingResponse {
  results?: GeocodingResult[];
}

export interface ReverseGeocodeResult {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
  latitude?: number;
  longitude?: number;
}

// --- Normalized Domain Models ---
export interface HourlyRowData {
  time: string; // ISO string
  hour: string; // e.g. "14:00"
  timestamp: number;
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  precipitationProbability: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  uvIndex: number;
  freezingLevel: number;
  relativeHumidity: number;
  visibility: number;
  cloudCover: number;
  europeanAqi: number | null;
  pm10: number | null;
  pm25: number | null;
}

export interface DailyForecastData {
  date: string; // "YYYY-MM-DD"
  dateLabel: string; // e.g. "Lun 19 Ott"
  dayName: string; // e.g. "Lunedì"
  isToday: boolean;
  weatherCode: number;
  tempMax: number;
  tempMin: number;
  apparentTempMax: number;
  apparentTempMin: number;
  sunrise: string;
  sunset: string;
  uvIndexMax: number;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  windGustsMax: number;
  hourly: HourlyRowData[]; // 24 hours for this day
}

export interface CurrentWeatherData {
  time: string;
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  isDay: boolean;
  precipitation: number;
  cloudCover: number;
  surfacePressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  relativeHumidity: number;
  freezingLevel: number;
}

export type EaqiLevel =
  | 'buona'
  | 'discreta'
  | 'moderata'
  | 'scarsa'
  | 'molto_scarsa'
  | 'estrema';

export interface AirQualityData {
  europeanAqi: number;
  level: EaqiLevel;
  label: string;
  colorClass: string;
  hexColor: string;
  pm10: number;
  pm25: number;
  nitrogenDioxide: number;
  ozone: number;
  pollen: {
    alder: number;
    birch: number;
    grass: number;
    mugwort: number;
    olive: number;
    ragweed: number;
  };
}

export interface Minutely15Slot {
  time: string;
  timeLabel: string; // "14:15"
  precipitation: number;
}

export interface NormalizedWeatherData {
  location: Location;
  current: CurrentWeatherData;
  airQuality: AirQualityData | null;
  minutely15: Minutely15Slot[];
  daily: DailyForecastData[];
  modelUsed: WeatherModel;
  updatedAt: string;
}

export type ViewMode = 'hourly' | 'chart' | 'radar';
