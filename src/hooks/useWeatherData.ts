import { useQuery } from '@tanstack/react-query';
import { format, parseISO, isToday } from 'date-fns';
import { it } from 'date-fns/locale';
import { fetchForecast } from '../api/weatherApi';
import { fetchAirQuality } from '../api/airQualityApi';
import { getEaqiInfo } from '../utils/aqiScale';
import type {
  Location,
  WeatherModel,
  NormalizedWeatherData,
  OpenMeteoForecastResponse,
  OpenMeteoAirQualityResponse,
  DailyForecastData,
  HourlyRowData,
  Minutely15Slot,
  AirQualityData,
} from '../types/weather.types';

function normalizeWeatherData(
  location: Location,
  forecast: OpenMeteoForecastResponse,
  airQuality: OpenMeteoAirQualityResponse,
  model: WeatherModel
): NormalizedWeatherData {
  // Map hourly air quality by ISO date string for quick O(1) alignment
  const aqiMap = new Map<string, { aqi: number; pm10: number; pm25: number }>();
  if (airQuality.hourly && airQuality.hourly.time) {
    for (let i = 0; i < airQuality.hourly.time.length; i++) {
      aqiMap.set(airQuality.hourly.time[i], {
        aqi: airQuality.hourly.european_aqi?.[i] ?? null,
        pm10: airQuality.hourly.pm10?.[i] ?? null,
        pm25: airQuality.hourly.pm2_5?.[i] ?? null,
      });
    }
  }

  // Pre-process all hourly forecast rows
  const allHourly: HourlyRowData[] = [];
  const hourlyCount = forecast.hourly.time.length;

  for (let i = 0; i < hourlyCount; i++) {
    const timeIso = forecast.hourly.time[i];
    const parsedDate = parseISO(timeIso);
    const aqiData = aqiMap.get(timeIso);

    allHourly.push({
      time: timeIso,
      hour: format(parsedDate, 'HH:mm'),
      timestamp: parsedDate.getTime(),
      temperature: Math.round(forecast.hourly.temperature_2m[i] * 10) / 10,
      apparentTemperature:
        Math.round(forecast.hourly.apparent_temperature[i] * 10) / 10,
      weatherCode: forecast.hourly.weather_code[i],
      precipitationProbability:
        forecast.hourly.precipitation_probability[i] ?? 0,
      precipitation:
        Math.round((forecast.hourly.precipitation[i] ?? 0) * 10) / 10,
      windSpeed: Math.round(forecast.hourly.wind_speed_10m[i]),
      windDirection: forecast.hourly.wind_direction_10m[i],
      windGusts: Math.round(forecast.hourly.wind_gusts_10m[i]),
      uvIndex: Math.round((forecast.hourly.uv_index[i] ?? 0) * 10) / 10,
      freezingLevel: Math.round(forecast.hourly.freezing_level_height[i] ?? 0),
      relativeHumidity: forecast.hourly.relative_humidity_2m[i] ?? 0,
      visibility: forecast.hourly.visibility[i] ?? 10000,
      cloudCover: forecast.hourly.cloud_cover[i] ?? 0,
      europeanAqi: aqiData?.aqi ?? null,
      pm10: aqiData?.pm10 ?? null,
      pm25: aqiData?.pm25 ?? null,
    });
  }

  // Build daily forecast list (7 days)
  const daily: DailyForecastData[] = [];
  const daysCount = forecast.daily.time.length;

  for (let d = 0; d < daysCount; d++) {
    const dateStr = forecast.daily.time[d];
    const dateObj = parseISO(dateStr);
    const today = isToday(dateObj);

    // Filter hourly data matching this specific day
    const dayPrefix = dateStr.slice(0, 10);
    const dayHourly = allHourly.filter((h) => h.time.startsWith(dayPrefix));

    const dayName = format(dateObj, 'EEEE', { locale: it });
    const capitalizedDayName =
      dayName.charAt(0).toUpperCase() + dayName.slice(1);
    const dateLabel = format(dateObj, 'EEE d MMM', { locale: it });

    daily.push({
      date: dateStr,
      dateLabel,
      dayName: capitalizedDayName,
      isToday: today,
      weatherCode: forecast.daily.weather_code[d],
      tempMax: Math.round(forecast.daily.temperature_2m_max[d]),
      tempMin: Math.round(forecast.daily.temperature_2m_min[d]),
      apparentTempMax: Math.round(forecast.daily.apparent_temperature_max[d]),
      apparentTempMin: Math.round(forecast.daily.apparent_temperature_min[d]),
      sunrise: forecast.daily.sunrise[d]
        ? format(parseISO(forecast.daily.sunrise[d]), 'HH:mm')
        : '--:--',
      sunset: forecast.daily.sunset[d]
        ? format(parseISO(forecast.daily.sunset[d]), 'HH:mm')
        : '--:--',
      uvIndexMax: Math.round((forecast.daily.uv_index_max[d] ?? 0) * 10) / 10,
      precipitationSum:
        Math.round((forecast.daily.precipitation_sum[d] ?? 0) * 10) / 10,
      precipitationProbabilityMax:
        forecast.daily.precipitation_probability_max[d] ?? 0,
      windSpeedMax: Math.round(forecast.daily.wind_speed_10m_max[d]),
      windGustsMax: Math.round(forecast.daily.wind_gusts_10m_max[d]),
      hourly: dayHourly,
    });
  }

  // Build Minutely15 slots (next 2 hours = up to 8 slots)
  const minutely15: Minutely15Slot[] = [];
  if (forecast.minutely_15 && forecast.minutely_15.time) {
    const nowEpoch = Date.now();
    for (let m = 0; m < forecast.minutely_15.time.length; m++) {
      const timeIso = forecast.minutely_15.time[m];
      const parsedTime = parseISO(timeIso);
      const timeMs = parsedTime.getTime();

      // Take upcoming slots within next 120 minutes
      if (timeMs >= nowEpoch - 15 * 60 * 1000 && minutely15.length < 8) {
        minutely15.push({
          time: timeIso,
          timeLabel: format(parsedTime, 'HH:mm'),
          precipitation:
            Math.round((forecast.minutely_15.precipitation[m] ?? 0) * 10) / 10,
        });
      }
    }
  }

  // Build current weather
  const cur = forecast.current;
  const currentFreezingLevel = allHourly[0]?.freezingLevel ?? 0;

  const current = {
    time: cur?.time ?? new Date().toISOString(),
    temperature: Math.round((cur?.temperature_2m ?? 0) * 10) / 10,
    apparentTemperature:
      Math.round((cur?.apparent_temperature ?? 0) * 10) / 10,
    weatherCode: cur?.weather_code ?? 0,
    isDay: cur?.is_day === 1,
    precipitation: Math.round((cur?.precipitation ?? 0) * 10) / 10,
    cloudCover: cur?.cloud_cover ?? 0,
    surfacePressure: Math.round(cur?.surface_pressure ?? 1013),
    windSpeed: Math.round(cur?.wind_speed_10m ?? 0),
    windDirection: cur?.wind_direction_10m ?? 0,
    windGusts: Math.round(cur?.wind_gusts_10m ?? 0),
    relativeHumidity: cur?.relative_humidity_2m ?? 0,
    freezingLevel: currentFreezingLevel,
  };

  // Build AirQuality
  let airQualityData: AirQualityData | null = null;
  if (airQuality.current) {
    const aqi = airQuality.current.european_aqi ?? 0;
    const info = getEaqiInfo(aqi);
    airQualityData = {
      europeanAqi: aqi,
      level: info.level,
      label: info.label,
      colorClass: info.colorClass,
      hexColor: info.hexColor,
      pm10: Math.round(airQuality.current.pm10 ?? 0),
      pm25: Math.round(airQuality.current.pm2_5 ?? 0),
      nitrogenDioxide: Math.round(airQuality.current.nitrogen_dioxide ?? 0),
      ozone: Math.round(airQuality.current.ozone ?? 0),
      pollen: {
        alder: Math.round(airQuality.current.alder_pollen ?? 0),
        birch: Math.round(airQuality.current.birch_pollen ?? 0),
        grass: Math.round(airQuality.current.grass_pollen ?? 0),
        mugwort: Math.round(airQuality.current.mugwort_pollen ?? 0),
        olive: Math.round(airQuality.current.olive_pollen ?? 0),
        ragweed: Math.round(airQuality.current.ragweed_pollen ?? 0),
      },
    };
  }

  return {
    location,
    current,
    airQuality: airQualityData,
    minutely15,
    daily,
    modelUsed: model,
    updatedAt: new Date().toISOString(),
  };
}

export function useWeatherData(location: Location, model: WeatherModel) {
  return useQuery({
    queryKey: ['weather', location.latitude, location.longitude, model],
    queryFn: async (): Promise<NormalizedWeatherData> => {
      const [forecast, airQuality] = await Promise.all([
        fetchForecast(location.latitude, location.longitude, model),
        fetchAirQuality(location.latitude, location.longitude),
      ]);

      return normalizeWeatherData(location, forecast, airQuality, model);
    },
    staleTime: 600000, // 10 minutes (da GEMINI.md)
    gcTime: 3600000, // 60 minutes (da GEMINI.md)
    refetchOnWindowFocus: false,
  });
}
