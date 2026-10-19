import type { EaqiLevel } from '../types/weather.types';

export interface EaqiInfo {
  level: EaqiLevel;
  label: string;
  colorClass: string;
  badgeBgClass: string;
  hexColor: string;
  description: string;
}

export function getEaqiInfo(aqi: number | null | undefined): EaqiInfo {
  if (aqi === null || aqi === undefined || isNaN(aqi)) {
    return {
      level: 'buona',
      label: 'N/D',
      colorClass: 'text-slate-400',
      badgeBgClass: 'bg-slate-800 text-slate-300 border-slate-700',
      hexColor: '#94a3b8',
      description: 'Dato qualità aria non disponibile',
    };
  }

  if (aqi <= 20) {
    return {
      level: 'buona',
      label: 'Buona',
      colorClass: 'text-emerald-400',
      badgeBgClass: 'bg-emerald-950/60 text-emerald-300 border-emerald-800/80',
      hexColor: '#10b981',
      description: 'Qualità dell’aria ottima. Nessun rischio per la salute.',
    };
  }

  if (aqi <= 40) {
    return {
      level: 'discreta',
      label: 'Discreta',
      colorClass: 'text-lime-400',
      badgeBgClass: 'bg-lime-950/60 text-lime-300 border-lime-800/80',
      hexColor: '#84cc16',
      description: 'Qualità dell’aria accettabile per la maggior parte delle persone.',
    };
  }

  if (aqi <= 60) {
    return {
      level: 'moderata',
      label: 'Moderata',
      colorClass: 'text-yellow-400',
      badgeBgClass: 'bg-yellow-950/60 text-yellow-300 border-yellow-800/80',
      hexColor: '#eab308',
      description: 'Soggetti particolarmente sensibili potrebbero avvertire sintomi lievi.',
    };
  }

  if (aqi <= 80) {
    return {
      level: 'scarsa',
      label: 'Scarsa',
      colorClass: 'text-orange-400',
      badgeBgClass: 'bg-orange-950/60 text-orange-300 border-orange-800/80',
      hexColor: '#f97316',
      description: 'Chiunque può risentire di effetti negativi. Riduci attività intense all’aperto.',
    };
  }

  if (aqi <= 100) {
    return {
      level: 'molto_scarsa',
      label: 'Molto scarsa',
      colorClass: 'text-red-400',
      badgeBgClass: 'bg-red-950/60 text-red-300 border-red-800/80',
      hexColor: '#ef4444',
      description: 'Condizioni insalubri. Evita sforzi prolungati all’aperto.',
    };
  }

  return {
    level: 'estrema',
    label: 'Estrema',
    colorClass: 'text-purple-400',
    badgeBgClass: 'bg-purple-950/60 text-purple-300 border-purple-800/80',
    hexColor: '#a855f7',
    description: 'Allarme sanitario grave. Rimanere in ambienti chiusi.',
  };
}
