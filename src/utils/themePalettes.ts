import type { AppTheme } from '../types/weather.types';

/**
 * Scala neutra a 11 step (50 → 950) che sostituisce la palette "slate" di Tailwind.
 *
 * Semantica dei ruoli (identica per temi scuri e chiari, cosi' i componenti non cambiano):
 * - 950: sotto-contenitori / pillole interne      - 400: testo attenuato (il piu' usato)
 * - 900: superficie card                          - 300/200: testo secondario
 * - 800: tracce, chip, bordi                      - 100/50: testo primario
 * - 700: bordi marcati   - 600/500: testo debole / etichette minori
 *
 * Nei temi chiari la scala e' "invertita": 900 e' quasi bianco e 100 quasi nero.
 */
export type NeutralStep = 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 | 950;
export type NeutralScale = Record<NeutralStep, string>;

export interface ThemePalette {
  mode: 'dark' | 'light';
  neutral: NeutralScale;
  bgApp: string;
}

export const NEUTRAL_STEPS: NeutralStep[] = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

const n = (values: string[]): NeutralScale =>
  Object.fromEntries(NEUTRAL_STEPS.map((step, i) => [step, values[i]])) as NeutralScale;

export const SLATE_SCALE = n([
  '#f8fafc', '#f1f5f9', '#e2e8f0', '#cbd5e1', '#94a3b8', '#64748b',
  '#475569', '#334155', '#1e293b', '#0f172a', '#020617',
]);

export const THEME_PALETTES: Record<Exclude<AppTheme, 'custom'>, ThemePalette> = {
  dynamic: {
    mode: 'dark',
    neutral: SLATE_SCALE,
    bgApp: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
  },
  slate: {
    mode: 'dark',
    neutral: SLATE_SCALE,
    bgApp: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
  },
  swiss: {
    mode: 'dark',
    neutral: SLATE_SCALE,
    bgApp: 'linear-gradient(180deg, #0f172a 0%, #020617 100%)',
  },
  oled: {
    mode: 'dark',
    neutral: n([
      '#fafafa', '#f4f4f5', '#e4e4e7', '#d4d4d8', '#a1a1aa', '#71717a',
      '#52525b', '#3f3f46', '#27272a', '#121214', '#000000',
    ]),
    bgApp: '#000000',
  },
  forest: {
    mode: 'dark',
    neutral: n([
      '#f3faf6', '#e6f4ec', '#cfe6d9', '#a9cfba', '#7fae96', '#5a8a72',
      '#416b57', '#2d5242', '#1d3b2f', '#10271e', '#06140f',
    ]),
    bgApp: 'linear-gradient(180deg, #0e2e22 0%, #071a13 55%, #030c08 100%)',
  },
  ocean: {
    mode: 'dark',
    neutral: n([
      '#f4f8fc', '#e8f0f9', '#cfdff0', '#a8c4e0', '#7d9fc6', '#5a7ca5',
      '#425f84', '#2f4868', '#1e3350', '#112238', '#050e1c',
    ]),
    bgApp: 'linear-gradient(180deg, #0d2a4d 0%, #071629 55%, #030a14 100%)',
  },
  cyberpink: {
    mode: 'dark',
    neutral: n([
      '#fdf5f9', '#faeaf3', '#f2d3e4', '#e4b0cc', '#c98aad', '#a3668b',
      '#7e4a6b', '#5e3550', '#432439', '#2a1424', '#160911',
    ]),
    bgApp: 'linear-gradient(180deg, #3a0c30 0%, #1c0818 55%, #0d040b 100%)',
  },
  light: {
    mode: 'light',
    neutral: n([
      '#020617', '#0f172a', '#1e293b', '#334155', '#526075', '#64748b',
      '#94a3b8', '#cdd7e3', '#e3eaf2', '#ffffff', '#eef3f8',
    ]),
    bgApp: 'linear-gradient(180deg, #d6e4f3 0%, #eaf0f7 45%, #f1f5f9 100%)',
  },
  warm_paper: {
    mode: 'light',
    neutral: n([
      '#0f0c09', '#1f1a15', '#342b22', '#4a3f34', '#6b5c4d', '#857565',
      '#a99a87', '#d9ccb5', '#ebe2d2', '#fffdf8', '#f4eee3',
    ]),
    bgApp: 'linear-gradient(180deg, #e9dfcb 0%, #f3ede1 50%, #efe7d8 100%)',
  },
  rose_milk: {
    mode: 'light',
    neutral: n([
      '#2a0b1d', '#3a142a', '#4c2239', '#62344c', '#84526b', '#9c6a83',
      '#bf8fa6', '#efc6d8', '#f8dfea', '#fffbfd', '#fcf0f5',
    ]),
    bgApp: 'linear-gradient(180deg, #f9d3e3 0%, #fcebf2 45%, #fdf3f7 100%)',
  },
};

/** Gradienti di sfondo del tema "Atmosferico" in base al meteo attuale */
export function getDynamicBackground(weatherCode: number, isDay: boolean): string {
  const isWet = (weatherCode >= 51 && weatherCode <= 67) || weatherCode >= 80;
  if (isWet) return 'linear-gradient(180deg, #0c2338 0%, #081523 55%, #020617 100%)';
  if (weatherCode <= 1) {
    return isDay
      ? 'linear-gradient(180deg, #0c2d4d 0%, #091d34 55%, #020617 100%)'
      : 'linear-gradient(180deg, #0d1333 0%, #070b1e 55%, #020617 100%)';
  }
  return THEME_PALETTES.dynamic.bgApp;
}
