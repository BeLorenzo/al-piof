/**
 * Motore di coerenza meteo multi-modello.
 *
 * Problema: il codice WMO restituito dai modelli e' "pessimista" (basta 0.1 mm o un singolo
 * modello umido per far comparire la pioggia, e il codice giornaliero e' il PEGGIORE della
 * giornata). Qui icona/etichetta vengono ricalcolate in modo che siano sempre coerenti con
 * i millimetri mostrati e con la maggioranza dei modelli (regola "2 su 3").
 */

/** Sotto questa soglia oraria l'accumulo e' considerato traccia (rumore numerico del modello) */
export const WET_HOURLY_MM = 0.2;
/** Una giornata e' "piovosa" (icona pioggia) solo con almeno 1 mm complessivo */
export const WET_DAILY_MM = 1.0;

type PrecipFamily =
  | 'drizzle'
  | 'freezing'
  | 'rain'
  | 'showers'
  | 'snow'
  | 'snowShowers'
  | 'thunder';

export function getPrecipFamily(code: number | null | undefined): PrecipFamily | null {
  if (code == null) return null;
  if (code >= 51 && code <= 55) return 'drizzle';
  if (code === 56 || code === 57 || code === 66 || code === 67) return 'freezing';
  if (code >= 61 && code <= 65) return 'rain';
  if (code >= 71 && code <= 77) return 'snow';
  if (code >= 80 && code <= 82) return 'showers';
  if (code === 85 || code === 86) return 'snowShowers';
  if (code >= 95) return 'thunder';
  return null;
}

export function cloudCoverToCode(cloudCover: number): number {
  if (cloudCover >= 80) return 3; // Coperto
  if (cloudCover >= 45) return 2; // Parzialmente nuvoloso
  if (cloudCover >= 15) return 1; // Prevalentemente sereno
  return 0; // Sereno
}

/** Mediana robusta: con 3 modelli coincide con la regola di maggioranza "2 su 3" */
export function median(values: (number | null | undefined)[]): number | null {
  const valid = values.filter((v): v is number => v != null && !isNaN(v)).sort((a, b) => a - b);
  if (valid.length === 0) return null;
  const mid = Math.floor(valid.length / 2);
  return valid.length % 2 === 0 ? (valid[mid - 1] + valid[mid]) / 2 : valid[mid];
}

function mostCommon<T>(items: T[]): T | null {
  if (items.length === 0) return null;
  const counts = new Map<T, number>();
  for (const it of items) counts.set(it, (counts.get(it) ?? 0) + 1);
  let best: T | null = null;
  let bestCount = 0;
  for (const [k, c] of counts) {
    if (c > bestCount) {
      best = k;
      bestCount = c;
    }
  }
  return best;
}

/** Intensita' coerente con i millimetri mostrati (soglie WMO orarie / giornaliere) */
function familyToCode(family: PrecipFamily, mm: number, scope: 'hourly' | 'daily', baseCode: number): number {
  const h = scope === 'hourly';
  switch (family) {
    case 'drizzle':
      return mm < (h ? 0.5 : 2) ? 51 : mm < (h ? 1 : 4) ? 53 : 55;
    case 'freezing':
      return mm < (h ? 1 : 4) ? 66 : 67;
    case 'rain':
      return mm < (h ? 2.5 : 5) ? 61 : mm < (h ? 7.6 : 20) ? 63 : 65;
    case 'showers':
      return mm < (h ? 2.5 : 5) ? 80 : mm < (h ? 7.6 : 20) ? 81 : 82;
    case 'snow':
      return mm < (h ? 1 : 3) ? 71 : mm < (h ? 3 : 10) ? 73 : 75;
    case 'snowShowers':
      return mm < (h ? 2 : 6) ? 85 : 86;
    case 'thunder':
      return baseCode === 96 || baseCode === 99 ? baseCode : 95;
  }
}

export interface HourlyCodeInput {
  /** Codice WMO del modello selezionato (o del blend) */
  baseCode: number;
  /** Precipitazione mostrata all'utente (mediana multi-modello o valore del modello) */
  precipitation: number;
  cloudCover: number;
  temperature: number;
  /** Codici WMO dei singoli modelli per la stessa ora (se disponibili) */
  modelCodes?: (number | null | undefined)[];
}

export function resolveHourlyCode({
  baseCode,
  precipitation,
  cloudCover,
  temperature,
  modelCodes,
}: HourlyCodeInput): number {
  const baseFamily = getPrecipFamily(baseCode);
  const isWet = precipitation >= WET_HOURLY_MM;

  if (!isWet) {
    // Asfalto asciutto: niente icone di pioggia/temporale, solo nuvolosita' reale
    return baseFamily ? cloudCoverToCode(cloudCover) : baseCode;
  }

  const validCodes = (modelCodes ?? []).filter((c): c is number => c != null);
  const modelFamilies = validCodes
    .map(getPrecipFamily)
    .filter((f): f is PrecipFamily => f !== null);

  let family: PrecipFamily | null = baseFamily;

  // Temporale solo se confermato da almeno meta' dei modelli disponibili
  if (family === 'thunder' && validCodes.length >= 2) {
    const thunderVotes = modelFamilies.filter((f) => f === 'thunder').length;
    if (thunderVotes * 2 < validCodes.length) {
      family = mostCommon(modelFamilies.filter((f) => f !== 'thunder')) ?? 'showers';
    }
  }

  if (!family) {
    family = mostCommon(modelFamilies) ?? (temperature <= 1 ? 'snow' : 'rain');
  }

  return familyToCode(family, precipitation, 'hourly', baseCode);
}

export interface DailyHourSample {
  hour: string; // "HH:mm"
  weatherCode: number; // gia' riconciliato con resolveHourlyCode
  cloudCover: number;
}

/**
 * Codice giornaliero rappresentativo (non il "peggiore" come fa l'API):
 * - pioggia solo se l'accumulo del giorno e' >= 1 mm
 * - nebbia solo se prevale nelle ore diurne
 * - altrimenti nuvolosita' media delle ore diurne (08-18)
 */
export function resolveDailyCode(
  hours: DailyHourSample[],
  precipitationSum: number,
  fallbackCode: number
): number {
  if (hours.length === 0) return fallbackCode;

  const wetFamilies = hours
    .map((h) => getPrecipFamily(h.weatherCode))
    .filter((f): f is PrecipFamily => f !== null);

  if (precipitationSum >= WET_DAILY_MM && wetFamilies.length > 0) {
    const thunderHour = hours.find((h) => getPrecipFamily(h.weatherCode) === 'thunder');
    if (thunderHour) return thunderHour.weatherCode;
    const family = mostCommon(wetFamilies) ?? 'rain';
    return familyToCode(family, precipitationSum, 'daily', fallbackCode);
  }

  const daytime = hours.filter((h) => {
    const hh = parseInt(h.hour.slice(0, 2), 10);
    return hh >= 8 && hh <= 18;
  });
  const sample = daytime.length > 0 ? daytime : hours;

  const fogHours = sample.filter((h) => h.weatherCode === 45 || h.weatherCode === 48);
  if (fogHours.length * 2 >= sample.length) {
    return mostCommon(fogHours.map((h) => h.weatherCode)) ?? 45;
  }

  const avgCloud = sample.reduce((acc, h) => acc + h.cloudCover, 0) / sample.length;
  return cloudCoverToCode(avgCloud);
}

/** Codice "adesso": la precipitazione corrente e' un accumulo su 15 minuti */
export function resolveCurrentCode(
  baseCode: number,
  precipitation15min: number,
  cloudCover: number,
  temperature: number
): number {
  return resolveHourlyCode({
    baseCode,
    precipitation: precipitation15min * 4,
    cloudCover,
    temperature,
  });
}
