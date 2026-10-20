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
  admin1?: string; // Regione
  admin2?: string; // Provincia
  population?: number;
  latitude: number;
  longitude: number;
  elevation?: number;
  isCurrentLocation?: boolean;
}

export interface ModelValueItem {
  modelName: string;
  modelId: string;
  value: number;
}

export interface MetricComparison {
  values: ModelValueItem[];
  min: number;
  max: number;
  spread: number;
  average?: number;
  agreement: 'Alta' | 'Media' | 'Bassa';
}

export interface RainComparison {
  values: ModelValueItem[];
  wetModelsCount: number;
  totalModelsCount: number;
  concordancePct: number;
  concordanceLabel: string;
}

export interface DayModelComparison {
  tempMax: MetricComparison;
  tempMin: MetricComparison;
  rain: RainComparison;
  overallReliability: 'Alta' | 'Media' | 'Bassa';
  overallScore: number;
  colorClass: string;
  leadTimeHorizon: string;
  leadTimeFactor: number;
}

export interface HourlyModelComparison {
  temperature: MetricComparison;
  rain: RainComparison;
  overallReliability: 'Alta' | 'Media' | 'Bassa';
  overallScore: number;
  dotColorClass: string;
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
    dew_point_2m?: number;
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
    dew_point_2m?: number[];
    surface_pressure?: number[];
    [key: string]: any; // Allows dynamic multi-model suffixes like temperature_2m_best_match
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
    [key: string]: any;
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
  population?: number;
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
  dewPoint: number;
  weatherCode: number;
  precipitationProbability: number;
  precipitation: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  uvIndex: number;
  uvIndexLabel: string; // e.g. "Basso", "Moderato"
  freezingLevel: number;
  relativeHumidity: number;
  visibility: number;
  cloudCover: number;
  surfacePressure: number;
  europeanAqi: number | null;
  pm10: number | null;
  pm25: number | null;
  comparison?: HourlyModelComparison;
}

export interface MoonInfo {
  phaseName: string; // e.g. "Luna Piena"
  phaseIcon: string;
  fraction: number; // 0 - 1
  illuminationPct: number; // 0 - 100%
  moonrise: string; // "21:30" or "--:--"
  moonset: string; // "07:15" or "--:--"
}

export type AppTheme =
  | 'dynamic'
  | 'oled'
  | 'light'
  | 'warm_paper'
  | 'rose_milk'
  | 'cyberpink'
  | 'forest'
  | 'ocean'
  | 'slate'
  | 'swiss'
  | 'custom';

export type AccentColor =
  | 'sky'
  | 'pink'
  | 'emerald'
  | 'amber'
  | 'violet'
  | 'rose'
  | 'custom';

export type AppFont = 'technical' | 'mono' | 'serif' | 'rounded' | 'editorial' | 'system';
export type TempUnit = 'celsius' | 'fahrenheit';
export type WindUnit = 'kmh' | 'ms' | 'knots';
export type SurfaceStyle = 'glass' | 'flat' | 'contrast';

export type BentoCardId =
  | 'visibility'
  | 'cloudSun'
  | 'airQuality'
  | 'pressureDew'
  | 'wind'
  | 'humidity'
  | 'uv'
  | 'sunMoon'
  | 'freezingLevel';

export interface UserPreferences {
  theme: AppTheme;
  customBgColor: string;
  accentColor: AccentColor;
  customAccentColor: string;
  font: AppFont;
  surfaceStyle: SurfaceStyle;
  useEnsembleAverageInBlend: boolean;
  roundTemperatures: boolean;
  windUnit: WindUnit;
  defaultFilterFromNow: boolean;
  compactHourlyRows: boolean;
  showTextSummary: boolean;
  showModelComparison: boolean;
  showHistoricalAlmanac: boolean;
  showBottomRadarPreview: boolean;
  visibleBentoCards: BentoCardId[];
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
  dewPointMax: number;
  dewPointMin: number;
  humidityAvg: number;
  visibilityMin: number;
  cloudCoverAvg: number;
  freezingLevelMax: number;
  freezingLevelMin: number;
  airQualityEaqi: number | null;
  airQualityLabel: string | null;
  airQualityColor: string | null;
  windDirectionDominant: number;
  sunrise: string;
  sunset: string;
  moon: MoonInfo;
  uvIndexMax: number;
  uvIndexLabel: string;
  precipitationSum: number;
  precipitationProbabilityMax: number;
  windSpeedMax: number;
  windGustsMax: number;
  pressureAvg: number;
  pressureTrend: 'rising' | 'falling' | 'steady';
  comparison?: DayModelComparison;
  summaryText: string;
  hourly: HourlyRowData[]; // 24 hours for this day
}

export interface CurrentWeatherData {
  time: string;
  temperature: number;
  apparentTemperature: number;
  dewPoint: number;
  dewPointComfort: string; // e.g. "Gradevole", "Secco", "Afoso"
  weatherCode: number;
  isDay: boolean;
  precipitation: number;
  cloudCover: number;
  visibility: number;
  surfacePressure: number;
  pressureTrend: 'rising' | 'falling' | 'steady';
  windSpeed: number;
  windDirection: number;
  windGusts: number;
  relativeHumidity: number;
  freezingLevel: number;
  comparison?: HourlyModelComparison;
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

export interface HistoricalYearRecord {
  year: number;
  yearsAgo: number;
  date: string;
  tempMax: number;
  tempMin: number;
  precipitation: number;
  weatherCode: number;
}

export interface HistoricalAlmanacData {
  referenceDate: string;
  avgTempMax: number;
  avgTempMin: number;
  currentTempMax: number;
  tempMaxAnomaly: number; // e.g. +1.8
  records: HistoricalYearRecord[];
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
