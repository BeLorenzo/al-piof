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
import { reconcileWeatherCode } from '../utils/wmoCodes';
import {
  calculateDewPoint,
  getDewPointComfort,
  getUvInfo,
  getMoonDetails,
  generateDaySummaryText,
  calculateDayModelComparison,
  calculateHourlyModelComparison,
  averageWindDirection,
} from '../utils/meteoMath';
import { useAppStore } from '../store/useAppStore';
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
  const preferences = useAppStore.getState().preferences;
  const isBlendMode = model === 'best_match';
  const applyEnsemble = isBlendMode && preferences.useEnsembleAverageInBlend;

  // Map hourly air quality by ISO string
  const aqiMap = new Map<string, { aqi: number | null; pm10: number | null; pm25: number | null }>();
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

    const rawUv = forecast.hourly.uv_index[i] ?? 0;
    const uvInfo = getUvInfo(rawUv);

    const surfacePressure =
      forecast.hourly.surface_pressure?.[i] ??
      forecast.current?.surface_pressure ??
      1013;

    let hourlyComparison: HourlyModelComparison | undefined;
    if (comparisons?.hourly) {
      const c = comparisons.hourly;
      const tempItems = [
        {
          modelName: 'MeteoSwiss',
          modelId: 'meteoswiss_icon_ch2',
          value: c.temperature_2m_meteoswiss_icon_ch2?.[i],
        },
        {
          modelName: 'ECMWF',
          modelId: 'ecmwf_ifs025',
          value: c.temperature_2m_ecmwf_ifs025?.[i] ?? c.temperature_2m?.[i],
        },
        {
          modelName: 'ICON',
          modelId: 'icon_seamless',
          value: c.temperature_2m_icon_seamless?.[i] ?? c.temperature_2m_icon_d2?.[i],
        },
      ];

      const rainItems = [
        {
          modelName: 'MeteoSwiss',
          modelId: 'meteoswiss_icon_ch2',
          value: c.precipitation_meteoswiss_icon_ch2?.[i],
        },
        {
          modelName: 'ECMWF',
          modelId: 'ecmwf_ifs025',
          value: c.precipitation_ecmwf_ifs025?.[i] ?? c.precipitation?.[i],
        },
        {
          modelName: 'ICON',
          modelId: 'icon_seamless',
          value: c.precipitation_icon_seamless?.[i] ?? c.precipitation_icon_d2?.[i],
        },
      ];

      hourlyComparison = calculateHourlyModelComparison(tempItems, rainItems);
    }

    // Applica la media dei modelli SOLO se l'utente è in modalità Blend e ha abilitato l'opzione
    const effectiveTemp =
      applyEnsemble && hourlyComparison?.temperature.average != null
        ? hourlyComparison.temperature.average
        : temperature;
    const tempDelta = effectiveTemp - temperature;
    const effectiveApparentTemp =
      Math.round((apparentTemperature + tempDelta) * 10) / 10;
    const effectiveDewPoint = calculateDewPoint(effectiveTemp, relativeHumidity);

    const cloudCoverVal = forecast.hourly.cloud_cover[i] ?? 0;
    const reconciledHourlyCode = reconcileWeatherCode(
      forecast.hourly.weather_code[i],
      precipitation,
      precipitationProbability,
      cloudCoverVal
    );

    allHourly.push({
      time: timeIso,
      hour: format(parsedDate, 'HH:mm'),
      timestamp: parsedDate.getTime(),
      temperature: effectiveTemp,
      apparentTemperature: effectiveApparentTemp,
      dewPoint: effectiveDewPoint,
      weatherCode: reconciledHourlyCode,
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

    // Umidità media reale delle 24 ore
    const humidities = dayHourly.map((h) => h.relativeHumidity);
    const humidityAvg = humidities.length
      ? Math.round(humidities.reduce((a, b) => a + b, 0) / humidities.length)
      : 60;

    // Visibilità minima (km) e Copertura nuvolosa media del giorno
    const visibilities = dayHourly.map((h) => h.visibility);
    const visibilityMin = visibilities.length
      ? Math.round(Math.min(...visibilities) / 100) / 10
      : 10;

    const cloudCovers = dayHourly.map((h) => h.cloudCover);
    const cloudCoverAvg = cloudCovers.length
      ? Math.round(cloudCovers.reduce((a, b) => a + b, 0) / cloudCovers.length)
      : 50;

    // Zero Termico Max e Min della giornata
    const freezingLevels = dayHourly.map((h) => h.freezingLevel);
    const freezingLevelMax = freezingLevels.length ? Math.max(...freezingLevels) : 0;
    const freezingLevelMin = freezingLevels.length ? Math.min(...freezingLevels) : 0;

    // Direzione vento prevalente/media trigonometrica
    const windAngles = dayHourly.map((h) => h.windDirection);
    const windDirectionDominant = averageWindDirection(windAngles);

    // Qualità dell'aria del giorno
    const dayAqis = dayHourly
      .map((h) => h.europeanAqi)
      .filter((v): v is number => v !== null && !isNaN(v));
    const dayMaxAqi = dayAqis.length
      ? Math.max(...dayAqis)
      : d === 0 && airQuality.current?.european_aqi != null
      ? airQuality.current.european_aqi
      : null;
    const dayAqiInfo = dayMaxAqi !== null ? getEaqiInfo(dayMaxAqi) : null;

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
      const c = comparisons.daily;
      const maxItems = [
        {
          modelName: 'MeteoSwiss',
          modelId: 'meteoswiss_icon_ch2',
          value: c.temperature_2m_max_meteoswiss_icon_ch2?.[d],
        },
        {
          modelName: 'ECMWF',
          modelId: 'ecmwf_ifs025',
          value: c.temperature_2m_max_ecmwf_ifs025?.[d] ?? c.temperature_2m_max?.[d],
        },
        {
          modelName: 'ICON',
          modelId: 'icon_seamless',
          value: c.temperature_2m_max_icon_seamless?.[d] ?? c.temperature_2m_max_icon_d2?.[d],
        },
      ];

      const minItems = [
        {
          modelName: 'MeteoSwiss',
          modelId: 'meteoswiss_icon_ch2',
          value: c.temperature_2m_min_meteoswiss_icon_ch2?.[d],
        },
        {
          modelName: 'ECMWF',
          modelId: 'ecmwf_ifs025',
          value: c.temperature_2m_min_ecmwf_ifs025?.[d] ?? c.temperature_2m_min?.[d],
        },
        {
          modelName: 'ICON',
          modelId: 'icon_seamless',
          value: c.temperature_2m_min_icon_seamless?.[d] ?? c.temperature_2m_min_icon_d2?.[d],
        },
      ];

      const rainItems = [
        {
          modelName: 'MeteoSwiss',
          modelId: 'meteoswiss_icon_ch2',
          value: c.precipitation_sum_meteoswiss_icon_ch2?.[d],
        },
        {
          modelName: 'ECMWF',
          modelId: 'ecmwf_ifs025',
          value: c.precipitation_sum_ecmwf_ifs025?.[d] ?? c.precipitation_sum?.[d],
        },
        {
          modelName: 'ICON',
          modelId: 'icon_seamless',
          value: c.precipitation_sum_icon_seamless?.[d] ?? c.precipitation_sum_icon_d2?.[d],
        },
      ];

      dayComparison = calculateDayModelComparison(maxItems, minItems, rainItems, d);
    }

    // Se la comparazione multimodello è presente e l'opzione è attiva in Blend, applichiamo la media a Max e Min
    const effectiveTempMax =
      applyEnsemble && dayComparison?.tempMax.average != null
        ? Math.round(dayComparison.tempMax.average)
        : tempMax;
    const effectiveTempMin =
      applyEnsemble && dayComparison?.tempMin.average != null
        ? Math.round(dayComparison.tempMin.average)
        : tempMin;

    const dailyReconciledCode = reconcileWeatherCode(
      forecast.daily.weather_code[d],
      precipitationSum,
      forecast.daily.precipitation_probability_max[d] ?? 0,
      cloudCoverAvg
    );

    daily.push({
      date: dateStr,
      dateLabel,
      dayName: capitalizedDayName,
      isToday: isToday(dateObj),
      weatherCode: dailyReconciledCode,
      tempMax: effectiveTempMax,
      tempMin: effectiveTempMin,
      apparentTempMax: Math.round(forecast.daily.apparent_temperature_max[d]),
      apparentTempMin: Math.round(forecast.daily.apparent_temperature_min[d]),
      dewPointMax,
      dewPointMin,
      humidityAvg,
      visibilityMin,
      cloudCoverAvg,
      freezingLevelMax,
      freezingLevelMin,
      airQualityEaqi: dayMaxAqi,
      airQualityLabel: dayAqiInfo?.label ?? null,
      airQualityColor: dayAqiInfo?.colorClass ?? null,
      windDirectionDominant,
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
  const nowHourIso = forecast.current?.time ? forecast.current.time.slice(0, 13) : '';
  const currentSlotIdx = Math.max(
    0,
    allHourly.findIndex((h) => h.time.startsWith(nowHourIso))
  );
  const currentSlot = allHourly[currentSlotIdx] ?? allHourly[0];
  const cur = forecast.current;

  const currentTemp =
    currentSlot?.temperature ??
    (cur?.temperature_2m != null
      ? Math.round(cur.temperature_2m * 10) / 10
      : 15);
  const currentApparentTemp =
    currentSlot?.apparentTemperature ??
    (cur?.apparent_temperature != null
      ? Math.round(cur.apparent_temperature * 10) / 10
      : currentTemp);
  const currentHumidity =
    cur?.relative_humidity_2m ?? currentSlot?.relativeHumidity ?? 60;
  const currentDewPoint = calculateDewPoint(currentTemp, currentHumidity);
  const dewPointComfort = getDewPointComfort(currentDewPoint).label;

  // Calcolo corretto del trend barometrico confrontando con 3 ore fa
  const pNow = cur?.surface_pressure ?? 1013;
  const pPastIdx = Math.max(0, currentSlotIdx - 3);
  const pPast = allHourly[pPastIdx]?.surfacePressure ?? pNow;
  const pDelta = pNow - pPast;
  const currentPressureTrend: 'rising' | 'falling' | 'steady' =
    pDelta > 0.8 ? 'rising' : pDelta < -0.8 ? 'falling' : 'steady';

  // Riconciliazione coerenza meteo attuale
  const curPrecip = Math.round((cur?.precipitation ?? 0) * 10) / 10;
  const curProb = currentSlot?.precipitationProbability ?? 0;
  const curCloud = cur?.cloud_cover ?? currentSlot?.cloudCover ?? 0;
  const rawCurCode = cur?.weather_code ?? currentSlot?.weatherCode ?? 0;
  const currentReconciledCode = reconcileWeatherCode(
    rawCurCode,
    curPrecip,
    curProb,
    curCloud
  );

  const current = {
    time: cur?.time ?? new Date().toISOString(),
    temperature: currentTemp,
    apparentTemperature: currentApparentTemp,
    dewPoint: currentDewPoint,
    dewPointComfort,
    weatherCode: currentReconciledCode,
    isDay: cur?.is_day === 1,
    precipitation: curPrecip,
    cloudCover: curCloud,
    visibility: currentSlot?.visibility ? Math.round(currentSlot.visibility / 100) / 10 : 10,
    surfacePressure: Math.round(pNow),
    pressureTrend: currentPressureTrend,
    windSpeed: Math.round(cur?.wind_speed_10m ?? 0),
    windDirection: cur?.wind_direction_10m ?? 0,
    windGusts: Math.round(cur?.wind_gusts_10m ?? 0),
    relativeHumidity: currentHumidity,
    freezingLevel: currentSlot?.freezingLevel ?? 0,
    comparison: currentSlot?.comparison ?? allHourly[0]?.comparison,
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
