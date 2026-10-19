import type {
  HistoricalAlmanacData,
  HistoricalYearRecord,
} from '../types/weather.types';

const ARCHIVE_API_URL = 'https://archive-api.open-meteo.com/v1/archive';

export async function fetchHistoricalAlmanac(
  latitude: number,
  longitude: number,
  selectedDateStr: string, // "YYYY-MM-DD"
  currentForecastMax: number
): Promise<HistoricalAlmanacData> {
  const parts = selectedDateStr.split('-');
  const currentYear = parseInt(parts[0], 10);
  const monthDay = `${parts[1]}-${parts[2]}`;

  // Past 5 years
  const targetYears = [1, 2, 3, 4, 5].map((offset) => currentYear - offset);

  const fetchYear = async (
    year: number,
    yearsAgo: number
  ): Promise<HistoricalYearRecord | null> => {
    const targetDate = `${year}-${monthDay}`;
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      start_date: targetDate,
      end_date: targetDate,
      daily:
        'temperature_2m_max,temperature_2m_min,precipitation_sum,weather_code',
      timezone: 'auto',
    });

    try {
      const res = await fetch(`${ARCHIVE_API_URL}?${params.toString()}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
        return null;
      }

      return {
        year,
        yearsAgo,
        date: targetDate,
        tempMax: Math.round(data.daily.temperature_2m_max[0] * 10) / 10,
        tempMin: Math.round(data.daily.temperature_2m_min[0] * 10) / 10,
        precipitation: Math.round((data.daily.precipitation_sum[0] || 0) * 10) / 10,
        weatherCode: data.daily.weather_code[0] ?? 0,
      };
    } catch {
      return null;
    }
  };

  const results = await Promise.all(
    targetYears.map((yr, idx) => fetchYear(yr, idx + 1))
  );

  const validRecords = results.filter((r): r is HistoricalYearRecord => r !== null);

  const avgTempMax =
    validRecords.length > 0
      ? Math.round(
          (validRecords.reduce((acc, r) => acc + r.tempMax, 0) /
            validRecords.length) *
            10
        ) / 10
      : currentForecastMax;

  const avgTempMin =
    validRecords.length > 0
      ? Math.round(
          (validRecords.reduce((acc, r) => acc + r.tempMin, 0) /
            validRecords.length) *
            10
        ) / 10
      : 10;

  const tempMaxAnomaly =
    Math.round((currentForecastMax - avgTempMax) * 10) / 10;

  return {
    referenceDate: selectedDateStr,
    avgTempMax,
    avgTempMin,
    currentTempMax: currentForecastMax,
    tempMaxAnomaly,
    records: validRecords,
  };
}
