import { Capacitor, registerPlugin } from '@capacitor/core';
import { format } from 'date-fns';
import type { NormalizedWeatherData, WidgetConfig } from '../types/weather.types';

interface WidgetBridgePlugin {
  openUrl?(options: { url: string }): Promise<{ success: boolean }>;
  updateWidgetData(data: {
    city?: string;
    temp?: string;
    desc?: string;
    iconEmoji?: string;
    subtext?: string;
    updateTime?: string;
    theme?: string;
    showRain?: boolean;
    rain?: string;
    showWind?: boolean;
    wind?: string;
    showAqi?: boolean;
    aqi?: string;
    showUv?: boolean;
    uv?: string;
    showHourlyStrip?: boolean;
    h1_time?: string;
    h1_icon?: string;
    h1_temp?: string;
    h2_time?: string;
    h2_icon?: string;
    h2_temp?: string;
    h3_time?: string;
    h3_icon?: string;
    h3_temp?: string;
    h4_time?: string;
    h4_icon?: string;
    h4_temp?: string;
  }): Promise<{ success: boolean }>;
}

const NativeWidgetBridge = registerPlugin<WidgetBridgePlugin>('WidgetBridge');

function getEmojiForWmoCode(code: number, isDay: boolean): string {
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

    let cityName = data.location.name;
    if (cityName.includes(' Giovanni XXIII')) {
      cityName = cityName.replace(' Giovanni XXIII', '');
    } else if (cityName.includes('(')) {
      cityName = cityName.split('(')[0].trim();
    }
    if (cityName.length > 20) {
      cityName = cityName.slice(0, 19) + '…';
    }

    const tempStr = `${Math.round(data.current.temperature * 10) / 10}°`;
    const minMaxStr = currentDay
      ? `Max ${Math.round(currentDay.tempMax)}° • Min ${Math.round(currentDay.tempMin)}° • Perc. ${Math.round(data.current.apparentTemperature)}°`
      : `Perc. ${Math.round(data.current.apparentTemperature)}°`;

    const rainProb = currentDay?.precipitationProbabilityMax ?? 0;
    const rainSum = currentDay?.precipitationSum ?? 0;
    const rainStr = `${rainProb}% • ${rainSum}mm`;

    const windStr = `${Math.round(data.current.windSpeed)} km/h`;
    const aqiStr = data.airQuality?.europeanAqi != null ? `AQI ${data.airQuality.europeanAqi}` : 'AQI --';
    const uvStr = `UV ${currentDay?.uvIndexMax ?? 3}`;

    const updateTime = format(new Date(), 'HH:mm');

    const theme = config?.theme ?? 'slate_dark';
    const showRain = config?.showRain ?? true;
    const showWind = config?.showWind ?? true;
    const showAqi = config?.showAqi ?? true;
    const showUv = config?.showUv ?? true;
    const showHourlyStrip = config?.showHourlyStrip ?? false;

    // Estrai le prossime 4 ore per il layout esteso
    const allTodayHourly = data.daily[0]?.hourly || [];
    const currentHourIso = format(new Date(), 'yyyy-MM-dd\'T\'HH:00');
    const currentIdx = allTodayHourly.findIndex((h) => h.time.startsWith(currentHourIso.slice(0, 13)));
    const startIdx = currentIdx >= 0 ? currentIdx + 1 : 12;

    const h1 = allTodayHourly[startIdx] || allTodayHourly[0];
    const h2 = allTodayHourly[startIdx + 1] || allTodayHourly[1];
    const h3 = allTodayHourly[startIdx + 2] || allTodayHourly[2];
    const h4 = allTodayHourly[startIdx + 3] || allTodayHourly[3];

    await NativeWidgetBridge.updateWidgetData({
      city: cityName,
      temp: tempStr,
      desc: data.daily[0]?.summaryText ? data.daily[0].summaryText : 'Meteo ' + cityName,
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
      showHourlyStrip,
      h1_time: h1 ? format(new Date(h1.time), 'HH:mm') : '13:00',
      h1_icon: getEmojiForWmoCode(h1?.weatherCode ?? 0, true),
      h1_temp: `${Math.round(h1?.temperature ?? 16)}°`,
      h2_time: h2 ? format(new Date(h2.time), 'HH:mm') : '14:00',
      h2_icon: getEmojiForWmoCode(h2?.weatherCode ?? 0, true),
      h2_temp: `${Math.round(h2?.temperature ?? 16)}°`,
      h3_time: h3 ? format(new Date(h3.time), 'HH:mm') : '15:00',
      h3_icon: getEmojiForWmoCode(h3?.weatherCode ?? 0, true),
      h3_temp: `${Math.round(h3?.temperature ?? 16)}°`,
      h4_time: h4 ? format(new Date(h4.time), 'HH:mm') : '16:00',
      h4_icon: getEmojiForWmoCode(h4?.weatherCode ?? 0, true),
      h4_temp: `${Math.round(h4?.temperature ?? 15)}°`,
    });
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
