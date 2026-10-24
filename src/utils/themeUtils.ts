import type {
  NormalizedWeatherData,
  UserPreferences,
} from '../types/weather.types';
import {
  NEUTRAL_STEPS,
  THEME_PALETTES,
  getDynamicBackground,
  type NeutralScale,
  type ThemePalette,
} from './themePalettes';

export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '').trim();
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.padEnd(6, '0');
  const num = parseInt(full.slice(0, 6), 16);
  if (isNaN(num)) return { r: 15, g: 23, b: 42 };
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function isLightColor(hex: string): boolean {
  const { r, g, b } = hexToRgb(hex);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 150;
}

export function mixHex(hex1: string, hex2: string, weight2: number): string {
  const c1 = hexToRgb(hex1);
  const c2 = hexToRgb(hex2);
  const w = Math.max(0, Math.min(1, weight2));
  const r = Math.round(c1.r * (1 - w) + c2.r * w);
  const g = Math.round(c1.g * (1 - w) + c2.g * w);
  const b = Math.round(c1.b * (1 - w) + c2.b * w);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

/** "#rrggbb" -> "r g b" (formato richiesto da Tailwind con <alpha-value>) */
function toChannels(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  return `${r} ${g} ${b}`;
}

export function getAccentHex(preferences: UserPreferences): string {
  switch (preferences.accentColor) {
    case 'pink':
      return '#f43f5e';
    case 'emerald':
      return '#10b981';
    case 'amber':
      return '#f59e0b';
    case 'violet':
      return '#a855f7';
    case 'rose':
      return '#e11d48';
    case 'custom':
      return preferences.customAccentColor || '#f43f5e';
    case 'sky':
    default:
      return '#38bdf8';
  }
}

/** Genera una scala neutra coerente partendo da un colore di sfondo libero */
function buildCustomPalette(baseHex: string): ThemePalette {
  const W = '#ffffff';
  const K = '#000000';
  if (isLightColor(baseHex)) {
    const toDark = [0.93, 0.88, 0.82, 0.74, 0.62, 0.52, 0.38, 0.14, 0.06];
    const values = [...toDark.map((w) => mixHex(baseHex, K, w)), mixHex(baseHex, W, 0.85), mixHex(baseHex, W, 0.4)];
    return {
      mode: 'light',
      neutral: Object.fromEntries(NEUTRAL_STEPS.map((s, i) => [s, values[i]])) as NeutralScale,
      bgApp: `linear-gradient(180deg, ${mixHex(baseHex, K, 0.06)} 0%, ${baseHex} 50%, ${mixHex(baseHex, W, 0.3)} 100%)`,
    };
  }
  const toLight = [0.97, 0.94, 0.88, 0.78, 0.62, 0.5, 0.38, 0.24, 0.14, 0.06];
  const values = [...toLight.map((w) => mixHex(baseHex, W, w)), mixHex(baseHex, K, 0.35)];
  return {
    mode: 'dark',
    neutral: Object.fromEntries(NEUTRAL_STEPS.map((s, i) => [s, values[i]])) as NeutralScale,
    bgApp: `linear-gradient(180deg, ${mixHex(baseHex, W, 0.05)} 0%, ${baseHex} 55%, ${mixHex(baseHex, K, 0.4)} 100%)`,
  };
}

export function resolvePalette(
  preferences: UserPreferences,
  data?: NormalizedWeatherData | null
): ThemePalette {
  const t = preferences.theme;
  if (t === 'custom') return buildCustomPalette(preferences.customBgColor || '#fce7f3');
  const palette = THEME_PALETTES[t] ?? THEME_PALETTES.dynamic;
  if (t === 'dynamic' && data?.current) {
    return { ...palette, bgApp: getDynamicBackground(data.current.weatherCode, data.current.isDay) };
  }
  return palette;
}

/**
 * Scala dell'accento: nei temi chiari le tonalita' usate per il testo (100-400)
 * vengono scurite per garantire leggibilita', mentre 800-950 diventano tinte pastello.
 */
function buildAccentScale(accent: string, mode: 'dark' | 'light'): Record<number, string> {
  const W = '#ffffff';
  const K = '#000000';
  if (mode === 'light') {
    return {
      50: mixHex(accent, K, 0.55), 100: mixHex(accent, K, 0.5), 200: mixHex(accent, K, 0.45),
      300: mixHex(accent, K, 0.38), 400: mixHex(accent, K, 0.3), 500: accent,
      600: mixHex(accent, K, 0.15), 700: mixHex(accent, K, 0.3), 800: mixHex(accent, W, 0.55),
      900: mixHex(accent, W, 0.75), 950: mixHex(accent, W, 0.88),
    };
  }
  return {
    50: mixHex(accent, W, 0.9), 100: mixHex(accent, W, 0.8), 200: mixHex(accent, W, 0.55),
    300: mixHex(accent, W, 0.3), 400: accent, 500: accent,
    600: mixHex(accent, K, 0.15), 700: mixHex(accent, K, 0.3), 800: mixHex(accent, K, 0.5),
    900: mixHex(accent, K, 0.7), 950: mixHex(accent, K, 0.82),
  };
}

export function getThemeCssVars(
  preferences: UserPreferences,
  data?: NormalizedWeatherData | null
): Record<string, string> {
  const palette = resolvePalette(preferences, data);
  const { neutral, mode } = palette;
  const accentHex = getAccentHex(preferences);
  const { r: ar, g: ag, b: ab } = hexToRgb(accentHex);
  const accentScale = buildAccentScale(accentHex, mode);

  const vars: Record<string, string> = {
    '--bg-app': palette.bgApp,
    '--bg-card-solid': neutral[900],
    '--bg-sub': neutral[950],
    '--border-main': neutral[800],
    '--text-primary': neutral[100],
    '--accent': accentHex,
    '--accent-soft': `rgba(${ar}, ${ag}, ${ab}, 0.18)`,
    '--accent-border': `rgba(${ar}, ${ag}, ${ab}, 0.55)`,
    '--accent-contrast': isLightColor(accentHex) ? '#090d16' : '#ffffff',
    '--c-white': mode === 'light' ? toChannels(neutral[100]) : '255 255 255',
  };

  for (const step of NEUTRAL_STEPS) {
    vars[`--n-${step}`] = toChannels(neutral[step]);
    vars[`--a-${step}`] = toChannels(accentScale[step]);
  }

  return vars;
}

/**
 * Applica il tema all'elemento <html>: variabili CSS, classe light/dark
 * e colore della barra di sistema (meta theme-color).
 */
export function applyThemeToDocument(
  preferences: UserPreferences,
  data?: NormalizedWeatherData | null
): void {
  const root = document.documentElement;
  const vars = getThemeCssVars(preferences, data);
  for (const [key, value] of Object.entries(vars)) {
    root.style.setProperty(key, value);
  }
  const palette = resolvePalette(preferences, data);
  root.classList.toggle('theme-light', palette.mode === 'light');
  root.classList.toggle('dark', palette.mode === 'dark');

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', palette.neutral[950]);
}
