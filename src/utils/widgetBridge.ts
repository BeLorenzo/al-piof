import { Capacitor, registerPlugin } from '@capacitor/core';
import { format } from 'date-fns';
import type { NormalizedWeatherData, WidgetConfig } from '../types/weather.types';
import { getWmoInfo } from './wmoCodes';

interface WidgetBridgePlugin {
  openUrl?(options: { url: string }): Promise<{ success: boolean }>;
  updateWidgetData(data: Record<string, string | boolean | undefined>): Promise<{ success: boolean }>;
}

const NativeWidgetBridge = registerPlugin<WidgetBridgePlugin>('WidgetBridge');

export function getEmojiForWmoCode(code: number, isDay: boolean): string {
  if (code === 0) return isDay ? '☀️' : '🌙';
  if (code === 1 || code === 2) return isDay ? '⛅' : '☁️';
  if (code === 3) return '☁️';
  if (code === 45 || code === 48) return '🌫️';
  if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) return '🌧️';
  if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) return '❄️';
  if (code >= 95) return '⛈️';
  return isDay ? '☀️' : '🌙';
}

export async function syncWidgetWithData(
  data: NormalizedWeatherData,
  config?: WidgetConfig
): Promise<void> {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    const currentDay = data.daily[0];
    const isDay = data.current.isDay;
    const emoji = getEmojiForWmoCode(data.current.weatherCode, isDay);
    const shortCondition = getWmoInfo(data.current.weatherCode, isDay).label;

    let cityName = data.location.name;
    if (cityName.includes(' Giovanni XXIII')) {
      cityName = cityName.replace(' Giovanni XXIII', '');
    } else if (cityName.includes('(')) {
      cityName = cityName.split('(')[0].trim();
    }
    if (cityName.length > 22) {
      cityName = cityName.slice(0, 21) + '…';
    }

    const tempStr = `${Math.round(data.current.temperature * 10) / 10}°`;
    const minMaxStr = currentDay
      ? `Max ${Math.round(currentDay.tempMax)}° Min ${Math.round(currentDay.tempMin)}° • Perc. ${Math.round(data.current.apparentTemperature)}°`
      : `Perc. ${Math.round(data.current.apparentTemperature)}°`;

    const rainProb = currentDay?.precipitationProbabilityMax ?? 0;
    const rainSum = currentDay?.precipitationSum ?? 0;
    const rainStr = `${rainProb}% • ${rainSum}mm`;

    const windStr = `${Math.round(data.current.windSpeed)} km/h`;
    const aqiStr =
      data.airQuality?.europeanAqi != null ? `AQI ${data.airQuality.europeanAqi}` : 'AQI --';
    const uvStr = `UV ${Math.round(currentDay?.uvIndexMax ?? 0)}`;
    const pressureStr = `${Math.round(data.current.surfacePressure)} hPa`;
    const humidityStr = `${Math.round(data.current.relativeHumidity)}%`;

    const updateTime = format(new Date(), 'HH:mm');

    const theme = config?.theme ?? 'slate_dark';
    const showRain = config?.showRain ?? true;
    const showWind = config?.showWind ?? true;
    const showAqi = config?.showAqi ?? true;
    const showUv = config?.showUv ?? true;
    const showPressure = config?.showPressure ?? false;
    const showHumidity = config?.showHumidity ?? false;

    // Estrai le prossime 4 ore unendo oggi e domani (così a fine serata continua sul giorno dopo)
    const combinedHourly = [
      ...(data.daily[0]?.hourly || []),
      ...(data.daily[1]?.hourly || []),
    ];
    const currentHourIso = format(new Date(), "yyyy-MM-dd'T'HH:00");
    const currentIdx = combinedHourly.findIndex((h) =>
      h.time.startsWith(currentHourIso.slice(0, 13))
    );
    const startIdx = currentIdx >= 0 ? currentIdx + 1 : 12;

    const payload: Record<string, string | boolean | undefined> = {
      city: cityName,
      temp: tempStr,
      desc: shortCondition,
      iconEmoji: emoji,
      subtext: minMaxStr,
      updateTime,
      theme,
      showRain,
      rain: rainStr,
      showWind,
      wind: windStr,
      showAqi,
      aqi: aqiStr,
      showUv,
      uv: uvStr,
      showPressure,
      pressure: pressureStr,
      showHumidity,
      humidity: humidityStr,
    };

    for (let i = 1; i <= 4; i++) {
      const h = combinedHourly[startIdx + i - 1] || combinedHourly[i - 1];
      const hourNum = h ? new Date(h.time).getHours() : 12 + i;
      const hIsDay = hourNum >= 7 && hourNum <= 19;
      payload[`h${i}_time`] = h ? format(new Date(h.time), 'HH:mm') : `${12 + i}:00`;
      payload[`h${i}_icon`] = getEmojiForWmoCode(h?.weatherCode ?? 0, hIsDay);
      payload[`h${i}_temp`] = `${Math.round(h?.temperature ?? 16)}°`;
    }

    // Estrai i prossimi 5 giorni (per espansione widget 4x3 e 4x4)
    for (let i = 1; i <= 5; i++) {
      const d = data.daily[i];
      if (d) {
        const shortDay = d.dateLabel.split(' ').slice(0, 2).join(' ');
        const dEmoji = getEmojiForWmoCode(d.weatherCode, true);
        const dLabel = getWmoInfo(d.weatherCode, true).label;
        payload[`d${i}_day`] = shortDay;
        payload[`d${i}_desc`] = `${dEmoji} ${dLabel}`;
        payload[`d${i}_rain`] =
          d.precipitationProbabilityMax >= 15 ? `💧 ${d.precipitationProbabilityMax}%` : '';
        payload[`d${i}_temp`] = `${Math.round(d.tempMax)}° / ${Math.round(d.tempMin)}°`;
      }
    }

    await NativeWidgetBridge.updateWidgetData(payload);
  } catch (err) {
    console.warn('[WidgetBridge] Failed to update widget:', err);
  }
}

export async function openExternalUrl(url: string): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    try {
      if (NativeWidgetBridge.openUrl) {
        await NativeWidgetBridge.openUrl({ url });
        return;
      }
    } catch (e) {
      console.warn('[WidgetBridge] openUrl failed, fallback to window.open:', e);
    }
  }
  window.open(url, '_blank');
}
