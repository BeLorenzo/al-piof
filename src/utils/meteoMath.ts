import * as SunCalc from 'suncalc';
import { format } from 'date-fns';
import type {
  ReliabilityInfo,
  ReliabilityRating,
  MoonInfo,
} from '../types/weather.types';

/**
 * Trigonometric circular mean for wind directions (degrees 0-360)
 */
export function averageWindDirection(angles: number[]): number {
  if (angles.length === 0) return 0;
  let sumX = 0;
  let sumY = 0;
  for (const deg of angles) {
    const rad = (deg * Math.PI) / 180;
    sumX += Math.cos(rad);
    sumY += Math.sin(rad);
  }
  const meanRad = Math.atan2(sumY, sumX);
  let meanDeg = (meanRad * 180) / Math.PI;
  if (meanDeg < 0) meanDeg += 360;
  return Math.round(meanDeg);
}

/**
 * Dew Point Magnus-Tetens calculation & Comfort Classification
 */
export function calculateDewPoint(temp: number, relativeHumidity: number): number {
  const a = 17.27;
  const b = 237.7;
  const rh = Math.max(0.01, Math.min(100, relativeHumidity));
  const alpha = (a * temp) / (b + temp) + Math.log(rh / 100);
  const dp = (b * alpha) / (a - alpha);
  return Math.round(dp * 10) / 10;
}

export function getDewPointComfort(dewPoint: number): {
  label: string;
  description: string;
  colorClass: string;
} {
  if (dewPoint < 10) {
    return {
      label: 'Secco / Fresco',
      description: 'Aria asciutta e frizzante, ottima traspirazione',
      colorClass: 'text-sky-300',
    };
  }
  if (dewPoint <= 16) {
    return {
      label: 'Gradevole',
      description: 'Livello di umidità ideale e confortevole',
      colorClass: 'text-emerald-400',
    };
  }
  if (dewPoint <= 20) {
    return {
      label: 'Umidità percepibile',
      description: 'Aria moderatamente pesante, leggermente umida',
      colorClass: 'text-amber-400',
    };
  }
  return {
    label: 'Molto afoso',
    description: 'Aria pesante, afa opprimente all’aperto',
    colorClass: 'text-rose-400',
  };
}

/**
 * Official WHO UV scale on /11
 */
export function getUvInfo(uv: number): {
  ratioText: string;
  label: string;
  colorClass: string;
  bgClass: string;
  progressPct: number;
} {
  const rounded = Math.round(uv);
  const progressPct = Math.min(100, Math.max(5, (uv / 11) * 100));

  if (rounded <= 2) {
    return {
      ratioText: `${rounded} / 11`,
      label: 'Basso',
      colorClass: 'text-emerald-400',
      bgClass: 'bg-emerald-500',
      progressPct,
    };
  }
  if (rounded <= 5) {
    return {
      ratioText: `${rounded} / 11`,
      label: 'Moderato',
      colorClass: 'text-yellow-400',
      bgClass: 'bg-yellow-500',
      progressPct,
    };
  }
  if (rounded <= 7) {
    return {
      ratioText: `${rounded} / 11`,
      label: 'Alto',
      colorClass: 'text-orange-400',
      bgClass: 'bg-orange-500',
      progressPct,
    };
  }
  if (rounded <= 10) {
    return {
      ratioText: `${rounded} / 11`,
      label: 'Molto Alto',
      colorClass: 'text-red-400',
      bgClass: 'bg-red-500',
      progressPct,
    };
  }
  return {
    ratioText: `${rounded} / 11`,
    label: 'Estremo',
    colorClass: 'text-purple-400',
    bgClass: 'bg-purple-500',
    progressPct: 100,
  };
}

/**
 * Multi-model ensemble reliability index calculation
 */
export function calculateReliability(
  temperatures: number[],
  precipitations: number[]
): ReliabilityInfo {
  const validTemps = temperatures.filter((t) => typeof t === 'number' && !isNaN(t));
  const validPrecip = precipitations.filter((p) => typeof p === 'number' && !isNaN(p));

  if (validTemps.length === 0) {
    return {
      rating: 'medium',
      score: 75,
      label: 'Media',
      colorClass: 'text-yellow-400',
      bgClass: 'bg-yellow-950/60 border-yellow-800/80',
      dotColorClass: 'bg-yellow-400',
      tempSpread: 0,
      tempStdDev: 0,
      minTemp: 0,
      maxTemp: 0,
      rainConcordance: 1,
    };
  }

  const minTemp = Math.min(...validTemps);
  const maxTemp = Math.max(...validTemps);
  const tempSpread = Math.round((maxTemp - minTemp) * 10) / 10;

  const meanTemp = validTemps.reduce((a, b) => a + b, 0) / validTemps.length;
  const variance =
    validTemps.reduce((acc, val) => acc + Math.pow(val - meanTemp, 2), 0) /
    validTemps.length;
  const tempStdDev = Math.round(Math.sqrt(variance) * 10) / 10;

  // Rain concordance (percentage of models that agree on wet vs dry)
  let rainConcordance = 1;
  if (validPrecip.length > 1) {
    const wetCount = validPrecip.filter((p) => p >= 0.2).length;
    const wetRatio = wetCount / validPrecip.length;
    rainConcordance = Math.max(wetRatio, 1 - wetRatio); // 0.5 (split) to 1.0 (unanimous)
  }

  // Score from 0 to 100
  let score = 100 - tempStdDev * 18 - (1 - rainConcordance) * 30;
  score = Math.max(25, Math.min(99, Math.round(score)));

  let rating: ReliabilityRating = 'high';
  let label = 'Alta';
  let colorClass = 'text-emerald-400';
  let bgClass = 'bg-emerald-950/60 border-emerald-800/80';
  let dotColorClass = 'bg-emerald-400';

  if (tempStdDev > 2.2 || score < 60) {
    rating = 'low';
    label = 'Bassa';
    colorClass = 'text-orange-400';
    bgClass = 'bg-orange-950/60 border-orange-800/80';
    dotColorClass = 'bg-orange-400';
  } else if (tempStdDev > 1.3 || score < 80) {
    rating = 'medium';
    label = 'Media';
    colorClass = 'text-yellow-400';
    bgClass = 'bg-yellow-950/60 border-yellow-800/80';
    dotColorClass = 'bg-yellow-400';
  }

  return {
    rating,
    score,
    label,
    colorClass,
    bgClass,
    dotColorClass,
    tempSpread,
    tempStdDev,
    minTemp: Math.round(minTemp * 10) / 10,
    maxTemp: Math.round(maxTemp * 10) / 10,
    rainConcordance: Math.round(rainConcordance * 100) / 100,
  };
}

/**
 * SunCalc Moon Phase in Italian & Moonrise / Moonset
 */
export function getMoonDetails(date: Date, lat: number, lon: number): MoonInfo {
  const moonIllum = SunCalc.getMoonIllumination(date);
  const moonTimes = SunCalc.getMoonTimes(date, lat, lon);

  const phase = moonIllum.phase; // 0 to 1
  let phaseName = 'Luna Nuova';
  let phaseIcon = '🌑';

  if (phase < 0.03 || phase > 0.97) {
    phaseName = 'Luna Nuova';
    phaseIcon = '🌑';
  } else if (phase < 0.22) {
    phaseName = 'Crescente';
    phaseIcon = '🌒';
  } else if (phase < 0.28) {
    phaseName = 'Primo Quarto';
    phaseIcon = '🌓';
  } else if (phase < 0.47) {
    phaseName = 'Gibbosa Crescente';
    phaseIcon = '🌔';
  } else if (phase < 0.53) {
    phaseName = 'Luna Piena';
    phaseIcon = '🌕';
  } else if (phase < 0.72) {
    phaseName = 'Gibbosa Calante';
    phaseIcon = '🌖';
  } else if (phase < 0.78) {
    phaseName = 'Ultimo Quarto';
    phaseIcon = '🌗';
  } else {
    phaseName = 'Calante';
    phaseIcon = '🌘';
  }

  const moonrise = moonTimes.rise ? format(moonTimes.rise, 'HH:mm') : '--:--';
  const moonset = moonTimes.set ? format(moonTimes.set, 'HH:mm') : '--:--';

  return {
    phaseName,
    phaseIcon,
    fraction: moonIllum.fraction,
    illuminationPct: Math.round(moonIllum.fraction * 100),
    moonrise,
    moonset,
  };
}

/**
 * Dynamic smart text summary for the day
 */
export function generateDaySummaryText(
  hourly: {
    hour: string;
    precipitation: number;
    windGusts: number;
    cloudCover: number;
    weatherCode: number;
  }[],
  precipitationSum: number
): string {
  if (!hourly || hourly.length === 0) return 'Previsioni stabili per la giornata.';

  const rainyHours = hourly.filter((h) => h.precipitation >= 0.2);
  const maxGust = Math.max(...hourly.map((h) => h.windGusts || 0));

  if (precipitationSum > 0 && rainyHours.length > 0) {
    const firstRainHour = rainyHours[0].hour;
    const isHeavy = precipitationSum >= 10;
    return `${isHeavy ? 'Piogge abbondanti' : 'Pioggia'} a partire dalle ${firstRainHour} (~${precipitationSum} mm complessivi). ${
      maxGust > 40 ? `Possibili raffiche fino a ${maxGust} km/h.` : ''
    }`.trim();
  }

  const avgClouds =
    hourly.reduce((acc, h) => acc + h.cloudCover, 0) / hourly.length;

  if (maxGust >= 45) {
    return `Attenzione a forti raffiche di vento fino a ${maxGust} km/h nel corso della giornata.`;
  }

  if (avgClouds < 20) {
    return 'Cielo limpido e sereno per tutta la giornata con ottima visibilità.';
  }

  if (avgClouds < 50) {
    return 'Prevalentemente soleggiato con passaggio di nubi innocue e temperature miti.';
  }

  const hasMorningFog = hourly.slice(4, 9).some((h) => h.weatherCode === 45 || h.weatherCode === 48);
  if (hasMorningFog) {
    return 'Possibili banchi di nebbia o foschia nelle prime ore del mattino, con schiarite a seguire.';
  }

  return 'Cielo in prevalenza coperto o molto nuvoloso, ma senza precipitazioni significative.';
}
