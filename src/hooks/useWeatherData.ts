import { useQuery } from '@tanstack/react-query';
import { format, parseISO, isToday } from 'date-fns';
import { it } from 'date-fns/locale';
import {
  fetchForecast,
  fetchModelComparisons,
  RawModelComparisonsResponse,
} from '../api/weatherApi';
import { fetchAirQuality } from '../api/airQualityApi';
import { getEaqiInfo } from '../utils/aqiScale';
import {
  calculateDewPoint,
  getDewPointComfort,
  getUvInfo,
  getMoonDetails,
  generateDaySummaryText,
  calculateDayModelComparison,
  calculateHourlyModelComparison,
} from '../utils/meteoMath';
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
  DayModelComparison,
  HourlyModelComparison,
} from '../types/weather.types';

function normalizeWeatherData(
  location: Location,
  forecast: OpenMeteoForecastResponse,
  airQuality: OpenMeteoAirQualityResponse,
  model: WeatherModel,
  comparisons?: RawModelComparisonsResponse | null
): NormalizedWeatherData {
  // Map hourly air quality by ISO string
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

  const allHourly: HourlyRowData[] = [];
  const hourlyCount = forecast.hourly.time.length;

  for (let i = 0; i < hourlyCount; i++) {
    const timeIso = forecast.hourly.time[i];
    const parsedDate = parseISO(timeIso);
    const aqiData = aqiMap.get(timeIso);

    const temperature =
      Math.round(forecast.hourly.temperature_2m[i] * 10) / 10;
    const apparentTemperature =
      Math.round(forecast.hourly.apparent_temperature[i] * 10) / 10;
    const precipitation =
      Math.round((forecast.hourly.precipitation[i] ?? 0) * 10) / 10;
    const precipitationProbability =
      forecast.hourly.precipitation_probability[i] ?? 0;
    const windSpeed = Math.round(forecast.hourly.wind_speed_10m[i]);
    const windGustsVal = Math.round(forecast.hourly.wind_gusts_10m[i]);
    const windDirection = forecast.hourly.wind_direction_10m[i];

    const relativeHumidity = forecast.hourly.relative_humidity_2m?.[i] ?? 60;
    const dewPoint =
      forecast.hourly.dew_point_2m?.[i] != null
        ? Math.round(forecast.hourly.dew_point_2m[i] * 10) / 10
        : calculateDewPoint(temperature, relativeHumidity);

    const rawUv = forecast.hourly.uv_index[i] ?? 0;
    const uvInfo = getUvInfo(rawUv);

    const surfacePressure =
      forecast.hourly.surface_pressure?.[i] ??
      forecast.current?.surface_pressure ??
      1013;

    let hourlyComparison: HourlyModelComparison | undefined;
    if (comparisons?.hourly) {
      const tempItems = [
        {
          modelName: 'MeteoSwiss',
          modelId: 'meteoswiss_icon_ch2',
          value: comparisons.hourly.temperature_2m_meteoswiss_icon_ch2?.[i],
        },
        {
          modelName: 'ECMWF',
          modelId: 'ecmwf_ifs025',
          value: comparisons.hourly.temperature_2m_ecmwf_ifs025?.[i],
        },
        {
          modelName: 'ICON-D2',
          modelId: 'icon_d2',
          value: comparisons.hourly.temperature_2m_icon_d2?.[i],
        },
      ];

      const rainItems = [
        {
          modelName: 'MeteoSwiss',
          modelId: 'meteoswiss_icon_ch2',
          value: comparisons.hourly.precipitation_meteoswiss_icon_ch2?.[i],
        },
        {
          modelName: 'ECMWF',
          modelId: 'ecmwf_ifs025',
          value: comparisons.hourly.precipitation_ecmwf_ifs025?.[i],
        },
        {
          modelName: 'ICON-D2',
          modelId: 'icon_d2',
          value: comparisons.hourly.precipitation_icon_d2?.[i],
        },
      ];

      hourlyComparison = calculateHourlyModelComparison(tempItems, rainItems);
    }

    allHourly.push({
      time: timeIso,
      hour: format(parsedDate, 'HH:mm'),
      timestamp: parsedDate.getTime(),
      temperature,
      apparentTemperature,
      dewPoint,
      weatherCode: forecast.hourly.weather_code[i],
      precipitationProbability,
      precipitation,
      windSpeed,
      windDirection,
      windGusts: windGustsVal,
      uvIndex: Math.round(rawUv * 10) / 10,
      uvIndexLabel: uvInfo.label,
      freezingLevel: Math.round(forecast.hourly.freezing_level_height[i] ?? 0),
      relativeHumidity,
      visibility: forecast.hourly.visibility[i] ?? 10000,
      cloudCover: forecast.hourly.cloud_cover[i] ?? 0,
      surfacePressure: Math.round(surfacePressure),
      europeanAqi: aqiData?.aqi ?? null,
      pm10: aqiData?.pm10 ?? null,
      pm25: aqiData?.pm25 ?? null,
      comparison: hourlyComparison,
    });
  }

  // Daily processing
  const daily: DailyForecastData[] = [];
  const daysCount = forecast.daily.time.length;

  for (let d = 0; d < daysCount; d++) {
    const dateStr = forecast.daily.time[d];
    const dateObj = parseISO(dateStr);
    const dayPrefix = dateStr.slice(0, 10);
    const dayHourly = allHourly.filter((h) => h.time.startsWith(dayPrefix));

    const dayName = format(dateObj, 'EEEE', { locale: it });
    const capitalizedDayName =
      dayName.charAt(0).toUpperCase() + dayName.slice(1);
    const dateLabel = format(dateObj, 'EEE d MMM', { locale: it });

    const tempMax = Math.round(forecast.daily.temperature_2m_max[d]);
    const tempMin = Math.round(forecast.daily.temperature_2m_min[d]);
    const precipitationSum =
      Math.round((forecast.daily.precipitation_sum[d] ?? 0) * 10) / 10;

    const dewPoints = dayHourly.map((h) => h.dewPoint);
    const dewPointMax = dewPoints.length ? Math.max(...dewPoints) : 10;
    const dewPointMin = dewPoints.length ? Math.min(...dewPoints) : 5;

    const rawUvMax = forecast.daily.uv_index_max[d] ?? 0;
    const uvMaxInfo = getUvInfo(rawUvMax);

    // Pressure trend calculation (diff between morning and evening)
    const pressures = dayHourly.map((h) => h.surfacePressure);
    const pressureAvg = pressures.length
      ? Math.round(pressures.reduce((a, b) => a + b, 0) / pressures.length)
      : 1013;
    const pStart = pressures[2] ?? 1013;
    const pEnd = pressures[pressures.length - 1] ?? 1013;
    const pressureDiff = pEnd - pStart;
    const pressureTrend: 'rising' | 'falling' | 'steady' =
      pressureDiff > 1.2 ? 'rising' : pressureDiff < -1.2 ? 'falling' : 'steady';

    // Moon details
    const moon = getMoonDetails(
      dateObj,
      location.latitude,
      location.longitude
    );

    // Dynamic smart text summary
    const summaryText = generateDaySummaryText(dayHourly, precipitationSum);

    let dayComparison: DayModelComparison | undefined;
    if (comparisons?.daily) {
      const maxItems = [
        {
          modelName: 'MeteoSwiss',
          modelId: 'meteoswiss_icon_ch2',
          value: comparisons.daily.temperature_2m_max_meteoswiss_icon_ch2?.[d],
        },
        {
          modelName: 'ECMWF',
          modelId: 'ecmwf_ifs025',
          value: comparisons.daily.temperature_2m_max_ecmwf_ifs025?.[d],
        },
        {
          modelName: 'ICON-D2',
          modelId: 'icon_d2',
          value: comparisons.daily.temperature_2m_max_icon_d2?.[d],
        },
      ];

      const minItems = [
        {
          modelName: 'MeteoSwiss',
          modelId: 'meteoswiss_icon_ch2',
          value: comparisons.daily.temperature_2m_min_meteoswiss_icon_ch2?.[d],
        },
        {
          modelName: 'ECMWF',
          modelId: 'ecmwf_ifs025',
          value: comparisons.daily.temperature_2m_min_ecmwf_ifs025?.[d],
        },
        {
          modelName: 'ICON-D2',
          modelId: 'icon_d2',
          value: comparisons.daily.temperature_2m_min_icon_d2?.[d],
        },
      ];

      const rainItems = [
        {
          modelName: 'MeteoSwiss',
          modelId: 'meteoswiss_icon_ch2',
          value: comparisons.daily.precipitation_sum_meteoswiss_icon_ch2?.[d],
        },
        {
          modelName: 'ECMWF',
          modelId: 'ecmwf_ifs025',
          value: comparisons.daily.precipitation_sum_ecmwf_ifs025?.[d],
        },
        {
          modelName: 'ICON-D2',
          modelId: 'icon_d2',
          value: comparisons.daily.precipitation_sum_icon_d2?.[d],
        },
      ];

      dayComparison = calculateDayModelComparison(maxItems, minItems, rainItems, d);
    }

    daily.push({
      date: dateStr,
      dateLabel,
      dayName: capitalizedDayName,
      isToday: isToday(dateObj),
      weatherCode: forecast.daily.weather_code[d],
      tempMax,
      tempMin,
      apparentTempMax: Math.round(forecast.daily.apparent_temperature_max[d]),
      apparentTempMin: Math.round(forecast.daily.apparent_temperature_min[d]),
      dewPointMax,
      dewPointMin,
      sunrise: forecast.daily.sunrise[d]
        ? format(parseISO(forecast.daily.sunrise[d]), 'HH:mm')
        : '--:--',
      sunset: forecast.daily.sunset[d]
        ? format(parseISO(forecast.daily.sunset[d]), 'HH:mm')
        : '--:--',
      moon,
      uvIndexMax: Math.round(rawUvMax * 10) / 10,
      uvIndexLabel: uvMaxInfo.label,
      precipitationSum,
      precipitationProbabilityMax:
        forecast.daily.precipitation_probability_max[d] ?? 0,
      windSpeedMax: Math.round(forecast.daily.wind_speed_10m_max[d]),
      windGustsMax: Math.round(forecast.daily.wind_gusts_10m_max[d]),
      pressureAvg,
      pressureTrend,
      comparison: dayComparison,
      summaryText,
      hourly: dayHourly,
    });
  }

  // Minutely15 upcoming slots
  const minutely15: Minutely15Slot[] = [];
  if (forecast.minutely_15 && forecast.minutely_15.time) {
    const nowEpoch = Date.now();
    for (let m = 0; m < forecast.minutely_15.time.length; m++) {
      const timeIso = forecast.minutely_15.time[m];
      const parsedTime = parseISO(timeIso);
      const timeMs = parsedTime.getTime();

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

  // Current weather
  const firstHourly = allHourly[0];
  const cur = forecast.current;
  const currentTemp =
    cur?.temperature_2m != null
      ? Math.round(cur.temperature_2m * 10) / 10
      : firstHourly?.temperature ?? 15;
  const currentHumidity =
    cur?.relative_humidity_2m ?? firstHourly?.relativeHumidity ?? 60;
  const currentDewPoint =
    cur?.dew_point_2m != null
      ? Math.round(cur.dew_point_2m * 10) / 10
      : calculateDewPoint(currentTemp, currentHumidity);
  const dewPointComfort = getDewPointComfort(currentDewPoint).label;

  const pNow = cur?.surface_pressure ?? 1013;
  const pPast = allHourly[Math.max(0, 0)]?.surfacePressure ?? pNow;
  const pDelta = pNow - pPast;
  const currentPressureTrend: 'rising' | 'falling' | 'steady' =
    pDelta > 1 ? 'rising' : pDelta < -1 ? 'falling' : 'steady';

  const current = {
    time: cur?.time ?? new Date().toISOString(),
    temperature: currentTemp,
    apparentTemperature:
      cur?.apparent_temperature != null
        ? Math.round(cur.apparent_temperature * 10) / 10
        : currentTemp,
    dewPoint: currentDewPoint,
    dewPointComfort,
    weatherCode: cur?.weather_code ?? firstHourly?.weatherCode ?? 0,
    isDay: cur?.is_day === 1,
    precipitation: Math.round((cur?.precipitation ?? 0) * 10) / 10,
    cloudCover: cur?.cloud_cover ?? 0,
    surfacePressure: Math.round(pNow),
    pressureTrend: currentPressureTrend,
    windSpeed: Math.round(cur?.wind_speed_10m ?? 0),
    windDirection: cur?.wind_direction_10m ?? 0,
    windGusts: Math.round(cur?.wind_gusts_10m ?? 0),
    relativeHumidity: currentHumidity,
    freezingLevel: firstHourly?.freezingLevel ?? 0,
    comparison: firstHourly?.comparison,
  };

  // AirQuality
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
      const [forecast, airQuality, comparisons] = await Promise.all([
        fetchForecast(location.latitude, location.longitude, model),
        fetchAirQuality(location.latitude, location.longitude),
        fetchModelComparisons(location.latitude, location.longitude),
      ]);

      return normalizeWeatherData(
        location,
        forecast,
        airQuality,
        model,
        comparisons
      );
    },
    staleTime: 600000,
    gcTime: 3600000,
    refetchOnWindowFocus: false,
  });
}
