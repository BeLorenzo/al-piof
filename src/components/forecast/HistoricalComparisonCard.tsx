import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { History, TrendingUp, TrendingDown, CloudRain, Loader2 } from 'lucide-react';
import { fetchHistoricalAlmanac } from '../../api/historicalApi';
import { getWmoInfo } from '../../utils/wmoCodes';

interface HistoricalComparisonCardProps {
  latitude: number;
  longitude: number;
  selectedDate: string; // "YYYY-MM-DD"
  currentTempMax: number;
}

export const HistoricalComparisonCard: React.FC<HistoricalComparisonCardProps> = ({
  latitude,
  longitude,
  selectedDate,
  currentTempMax,
}) => {
  const { data, isLoading } = useQuery({
    queryKey: ['almanac', latitude, longitude, selectedDate, currentTempMax],
    queryFn: () =>
      fetchHistoricalAlmanac(latitude, longitude, selectedDate, currentTempMax),
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  if (isLoading) {
    return (
      <div className="mx-4 my-3 p-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl flex items-center justify-center gap-2 text-xs text-slate-400">
        <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
        <span>Consultazione almanacco storico (2021-2025)...</span>
      </div>
    );
  }

  if (!data || data.records.length === 0) return null;

  const isWarmer = data.tempMaxAnomaly >= 0;

  return (
    <div className="mx-4 my-3 p-4 bg-slate-900/70 border border-slate-800/90 rounded-3xl shadow-xl backdrop-blur-md space-y-3">
      {/* Title & Anomaly Badge */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Almanacco Storico
            </h4>
            <div className="text-[10px] text-slate-400">
              Stesso giorno negli ultimi 5 anni
            </div>
          </div>
        </div>

        {/* Anomaly Badge */}
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold border ${
            isWarmer
              ? 'bg-rose-950/60 border-rose-800/80 text-rose-300'
              : 'bg-cyan-950/60 border-cyan-800/80 text-cyan-300'
          }`}
        >
          {isWarmer ? (
            <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 text-cyan-400" />
          )}
          <span>
            {isWarmer ? `+${data.tempMaxAnomaly}` : data.tempMaxAnomaly}°C vs media
          </span>
        </div>
      </div>

      {/* Subtitle info */}
      <div className="text-[11px] text-slate-400">
        Media max quinquennio: <span className="text-slate-200 font-semibold">{data.avgTempMax}°C</span> (oggi prevista <span className="text-white font-bold">{currentTempMax}°C</span>)
      </div>

      {/* Comparative Mini-Cards */}
      <div className="grid grid-cols-5 gap-1.5 pt-1">
        {data.records.map((rec) => {
          const wmo = getWmoInfo(rec.weatherCode, true);
          const WmoIcon = wmo.icon;

          return (
            <div
              key={rec.year}
              className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/70 flex flex-col items-center justify-between text-center min-h-[92px]"
            >
              <div className="text-[10px] font-bold text-slate-300">
                {rec.yearsAgo}a fa
              </div>
              <div className="text-[9px] text-slate-500 leading-none mb-1">
                {rec.year}
              </div>

              <div className="my-0.5">
                <WmoIcon className={`w-4 h-4 ${wmo.colorClass}`} />
              </div>

              <div className="text-[11px] font-bold text-white tracking-tight leading-tight mt-1">
                {rec.tempMax}°
              </div>
              <div className="text-[9px] text-slate-400 leading-tight">
                {rec.tempMin}°
              </div>

              {rec.precipitation > 0 ? (
                <div className="flex items-center gap-0.5 text-[8px] text-cyan-400 font-medium mt-0.5">
                  <CloudRain className="w-2.5 h-2.5" />
                  <span>{rec.precipitation}m</span>
                </div>
              ) : (
                <div className="text-[8px] text-slate-600 mt-0.5">0 mm</div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
