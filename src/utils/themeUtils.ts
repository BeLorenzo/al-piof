import type React from 'react';
import type {
  NormalizedWeatherData,
  UserPreferences,
} from '../types/weather.types';

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

export function getThemeCssVars(
  preferences: UserPreferences,
  data?: NormalizedWeatherData | null
): React.CSSProperties {
  const accentHex = getAccentHex(preferences);
  const { r: ar, g: ag, b: ab } = hexToRgb(accentHex);
  const accentContrast = isLightColor(accentHex) ? '#090d16' : '#ffffff';

  let bgApp = 'linear-gradient(180deg, #0f172a 0%, #020617 100%)';
  let bgHeader = 'rgba(2, 6, 23, 0.88)';
  let bgCard = 'rgba(15, 23, 42, 0.78)';
  let bgCardSolid = '#0f172a';
  let bgSub = 'rgba(2, 6, 23, 0.65)';
  let borderMain = 'rgba(30, 41, 59, 0.85)';
  let textPrimary = '#f8fafc';
  let textSecondary = '#cbd5e1';
  let textMuted = '#94a3b8';

  const t = preferences.theme;

  if (t === 'oled') {
    bgApp = '#000000';
    bgHeader = 'rgba(0, 0, 0, 0.92)';
    bgCard = 'rgba(12, 12, 15, 0.95)';
    bgCardSolid = '#0a0a0d';
    bgSub = 'rgba(20, 20, 25, 0.95)';
    borderMain = 'rgba(39, 39, 46, 0.9)';
  } else if (t === 'light') {
    bgApp = 'linear-gradient(180deg, #dbeafe 0%, #f1f5f9 45%, #e2e8f0 100%)';
    bgHeader = 'rgba(241, 245, 249, 0.92)';
    bgCard = 'rgba(255, 255, 255, 0.94)';
    bgCardSolid = '#ffffff';
    bgSub = 'rgba(241, 245, 249, 0.95)';
    borderMain = 'rgba(203, 213, 225, 0.95)';
    textPrimary = '#0f172a';
    textSecondary = '#334155';
    textMuted = '#64748b';
  } else if (t === 'warm_paper') {
    bgApp = 'linear-gradient(180deg, #e7decb 0%, #f5f0e6 50%, #ebe3d2 100%)';
    bgHeader = 'rgba(245, 240, 230, 0.92)';
    bgCard = 'rgba(252, 249, 242, 0.94)';
    bgCardSolid = '#fcf8f0';
    bgSub = 'rgba(235, 227, 210, 0.9)';
    borderMain = 'rgba(210, 196, 172, 0.95)';
    textPrimary = '#1c1917';
    textSecondary = '#44403c';
    textMuted = '#78716c';
  } else if (t === 'rose_milk') {
    bgApp = 'linear-gradient(180deg, #fbcfe8 0%, #fdf2f8 50%, #fce7f3 100%)';
    bgHeader = 'rgba(253, 242, 248, 0.92)';
    bgCard = 'rgba(255, 255, 255, 0.92)';
    bgCardSolid = '#ffffff';
    bgSub = 'rgba(252, 231, 243, 0.9)';
    borderMain = 'rgba(244, 114, 182, 0.4)';
    textPrimary = '#4a044e';
    textSecondary = '#701a75';
    textMuted = '#9d174d';
  } else if (t === 'cyberpink') {
    bgApp = 'linear-gradient(180deg, #3b0731 0%, #1a0618 55%, #0d020c 100%)';
    bgHeader = 'rgba(26, 6, 24, 0.9)';
    bgCard = 'rgba(46, 12, 42, 0.85)';
    bgCardSolid = '#240722';
    bgSub = 'rgba(29, 6, 27, 0.9)';
    borderMain = 'rgba(219, 39, 119, 0.4)';
    textPrimary = '#fdf2f8';
    textSecondary = '#fbcfe8';
    textMuted = '#f472b6';
  } else if (t === 'forest') {
    bgApp = 'linear-gradient(180deg, #0d3325 0%, #071912 55%, #030d09 100%)';
    bgHeader = 'rgba(7, 25, 18, 0.9)';
    bgCard = 'rgba(14, 43, 32, 0.85)';
    bgCardSolid = '#0c241c';
    bgSub = 'rgba(8, 28, 20, 0.9)';
    borderMain = 'rgba(16, 185, 129, 0.35)';
    textPrimary = '#ecfdf5';
    textSecondary = '#a7f3d0';
    textMuted = '#6ee7b7';
  } else if (t === 'ocean') {
    bgApp = 'linear-gradient(180deg, #0d2b52 0%, #07172e 55%, #030b17 100%)';
    bgHeader = 'rgba(7, 23, 46, 0.9)';
    bgCard = 'rgba(15, 39, 71, 0.85)';
    bgCardSolid = '#0a203b';
    bgSub = 'rgba(9, 25, 48, 0.9)';
    borderMain = 'rgba(56, 189, 248, 0.35)';
    textPrimary = '#f0f9ff';
    textSecondary = '#bae6fd';
    textMuted = '#7dd3fc';
  } else if (t === 'custom') {
    const baseHex = preferences.customBgColor || '#fce7f3';
    const light = isLightColor(baseHex);
    if (light) {
      bgApp = `linear-gradient(180deg, ${mixHex(baseHex, '#ffffff', 0.15)} 0%, ${baseHex} 100%)`;
      bgHeader = `${mixHex(baseHex, '#ffffff', 0.3)}e8`;
      bgCard = 'rgba(255, 255, 255, 0.9)';
      bgCardSolid = '#ffffff';
      bgSub = mixHex(baseHex, '#ffffff', 0.45);
      borderMain = mixHex(baseHex, '#000000', 0.18);
      textPrimary = '#0f172a';
      textSecondary = '#1e293b';
      textMuted = '#475569';
    } else {
      bgApp = `linear-gradient(180deg, ${mixHex(baseHex, '#ffffff', 0.08)} 0%, ${baseHex} 100%)`;
      bgHeader = `${baseHex}e8`;
      bgCard = mixHex(baseHex, '#ffffff', 0.1);
      bgCardSolid = mixHex(baseHex, '#000000', 0.2);
      bgSub = mixHex(baseHex, '#000000', 0.28);
      borderMain = mixHex(baseHex, '#ffffff', 0.22);
      textPrimary = '#f8fafc';
      textSecondary = '#e2e8f0';
      textMuted = '#94a3b8';
    }
  } else if (t === 'dynamic') {
    const cur = data?.current;
    const code = cur?.weatherCode ?? 0;
    const isDay = cur?.isDay ?? true;
    bgCardSolid = '#0a1d2e';
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 99)) {
      bgApp = 'linear-gradient(180deg, #0c2338 0%, #081523 55%, #020617 100%)';
      bgCard = 'rgba(12, 30, 48, 0.8)';
    } else if (!isDay && (code === 0 || code === 1)) {
      bgApp = 'linear-gradient(180deg, #0d1333 0%, #070b1e 55%, #020617 100%)';
      bgCard = 'rgba(15, 20, 48, 0.8)';
    } else if (isDay && (code === 0 || code === 1)) {
      bgApp = 'linear-gradient(180deg, #0c2d4d 0%, #091d34 55%, #020617 100%)';
      bgCard = 'rgba(14, 34, 56, 0.8)';
    }
  }

  return {
    '--bg-app': bgApp,
    '--bg-header': bgHeader,
    '--bg-card': bgCard,
    '--bg-card-solid': bgCardSolid,
    '--bg-sub': bgSub,
    '--border-main': borderMain,
    '--text-primary': textPrimary,
    '--text-secondary': textSecondary,
    '--text-muted': textMuted,
    '--accent': accentHex,
    '--accent-soft': `rgba(${ar}, ${ag}, ${ab}, 0.18)`,
    '--accent-border': `rgba(${ar}, ${ag}, ${ab}, 0.55)`,
    '--accent-contrast': accentContrast,
  } as React.CSSProperties;
}
