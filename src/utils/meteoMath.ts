import * as SunCalc from 'suncalc';
import { format } from 'date-fns';
import type {
  MoonInfo,
  MetricComparison,
  RainComparison,
  DayModelComparison,
  HourlyModelComparison,
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

export function buildMetricComparison(
  items: { modelName: string; modelId: string; value: number | null | undefined }[]
): MetricComparison | null {
  const valid = items.filter(
    (i) => i.value !== null && i.value !== undefined && !isNaN(i.value)
  ) as { modelName: string; modelId: string; value: number }[];

  if (valid.length === 0) return null;

  const valuesOnly = valid.map((i) => i.value);
  const min = Math.min(...valuesOnly);
  const max = Math.max(...valuesOnly);
  const spread = Math.round((max - min) * 10) / 10;

  let agreement: 'Alta' | 'Media' | 'Bassa' = 'Alta';
  if (spread > 3.0) {
    agreement = 'Bassa';
  } else if (spread > 1.5) {
    agreement = 'Media';
  }

  return {
    values: valid.map((v) => ({ ...v, value: Math.round(v.value * 10) / 10 })),
    min: Math.round(min * 10) / 10,
    max: Math.round(max * 10) / 10,
    spread,
    agreement,
  };
}

export function buildRainComparison(
  items: { modelName: string; modelId: string; value: number | null | undefined }[]
): RainComparison | null {
  const valid = items.filter(
    (i) => i.value !== null && i.value !== undefined && !isNaN(i.value)
  ) as { modelName: string; modelId: string; value: number }[];

  if (valid.length === 0) return null;

  const wetCount = valid.filter((i) => i.value >= 0.2).length;
  const total = valid.length;
  const wetRatio = wetCount / total;
  const concordanceRatio = Math.max(wetRatio, 1 - wetRatio);
  const concordancePct = Math.round(concordanceRatio * 100);

  let concordanceLabel = 'Tutti concordi: asciutto';
  if (wetCount === total) {
    concordanceLabel = 'Tutti concordi: pioggia';
  } else if (wetCount === 0) {
    concordanceLabel = 'Tutti concordi: asciutto';
  } else if (wetCount > total / 2) {
    concordanceLabel = `${wetCount}/${total} modelli prevedono pioggia`;
  } else {
    concordanceLabel = `${total - wetCount}/${total} modelli prevedono asciutto`;
  }

  return {
    values: valid.map((v) => ({ ...v, value: Math.round(v.value * 10) / 10 })),
    wetModelsCount: wetCount,
    totalModelsCount: total,
    concordancePct,
    concordanceLabel,
  };
}

export function calculateDayModelComparison(
  tempMaxItems: { modelName: string; modelId: string; value: number | null | undefined }[],
  tempMinItems: { modelName: string; modelId: string; value: number | null | undefined }[],
  rainItems: { modelName: string; modelId: string; value: number | null | undefined }[]
): DayModelComparison | undefined {
  const tempMax = buildMetricComparison(tempMaxItems);
  const tempMin = buildMetricComparison(tempMinItems);
  const rain = buildRainComparison(rainItems);

  if (!tempMax || !tempMin || !rain) return undefined;

  let score = 100 - tempMax.spread * 12 - tempMin.spread * 8 - (100 - rain.concordancePct) * 0.4;
  score = Math.max(25, Math.min(99, Math.round(score)));

  let overallReliability: 'Alta' | 'Media' | 'Bassa' = 'Alta';
  let colorClass = 'text-emerald-400';

  if (score < 60 || tempMax.spread > 3.0) {
    overallReliability = 'Bassa';
    colorClass = 'text-orange-400';
  } else if (score < 80 || tempMax.spread > 1.6) {
    overallReliability = 'Media';
    colorClass = 'text-yellow-400';
  }

  return {
    tempMax,
    tempMin,
    rain,
    overallReliability,
    overallScore: score,
    colorClass,
  };
}

export function calculateHourlyModelComparison(
  tempItems: { modelName: string; modelId: string; value: number | null | undefined }[],
  rainItems: { modelName: string; modelId: string; value: number | null | undefined }[]
): HourlyModelComparison | undefined {
  const temperature = buildMetricComparison(tempItems);
  const rain = buildRainComparison(rainItems);

  if (!temperature || !rain) return undefined;

  let score = 100 - temperature.spread * 15 - (100 - rain.concordancePct) * 0.35;
  score = Math.max(30, Math.min(99, Math.round(score)));

  let overallReliability: 'Alta' | 'Media' | 'Bassa' = 'Alta';
  let dotColorClass = 'bg-emerald-400';

  if (score < 65 || temperature.spread > 2.5) {
    overallReliability = 'Bassa';
    dotColorClass = 'bg-orange-400';
  } else if (score < 82 || temperature.spread > 1.4) {
    overallReliability = 'Media';
    dotColorClass = 'bg-yellow-400';
  }

  return {
    temperature,
    rain,
    overallReliability,
    overallScore: score,
    dotColorClass,
  };
}

