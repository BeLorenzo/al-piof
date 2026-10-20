import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getWmoInfo } from '../../utils/wmoCodes';
import { formatTemperature } from '../../utils/meteoMath';
import type { DailyForecastData } from '../../types/weather.types';

interface DaySelectorProps {
  days: DailyForecastData[];
}

export const DaySelector: React.FC<DaySelectorProps> = ({ days }) => {
  const { selectedDayIndex, setSelectedDayIndex, preferences } = useAppStore();

  return (
    <div className="w-full bg-slate-950/70 backdrop-blur-md border-y border-slate-800/80 py-2 px-4 card-surface">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {days.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;
          const wmo = getWmoInfo(day.weatherCode, true);
          const WmoIcon = wmo.icon;
          const hasRain = day.precipitationSum > 0;

          const reliabilityColor =
            day.comparison?.overallReliability === 'Alta'
              ? 'bg-emerald-400'
              : day.comparison?.overallReliability === 'Media'
              ? 'bg-yellow-400'
              : day.comparison?.overallReliability === 'Bassa'
              ? 'bg-orange-400'
              : 'bg-slate-600';

          return (
            <button
              key={day.date}
              onClick={() => setSelectedDayIndex(idx)}
              className={`shrink-0 flex flex-col items-center justify-between p-2 rounded-2xl border transition-all w-[72px] h-[108px] relative select-none ${
                isSelected
                  ? 'bg-slate-800/95 border-sky-400 shadow-md shadow-sky-950/50 text-white ring-1 ring-sky-400/40'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
              type="button"
            >
              {/* Top indicators: Micro reliability bar & Rain dot */}
              <div className="w-full flex items-center justify-between px-1">
                <span
                  className={`w-2 h-1 rounded-full ${reliabilityColor}`}
                  title={
                    day.comparison
                      ? `Affidabilità: ${day.comparison.overallReliability} (${day.comparison.overallScore}%)`
                      : 'Modello base'
                  }
                />
                {hasRain && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 ring-2 ring-slate-950" />
                )}
              </div>

              {/* Day title */}
              <div className="text-center mt-0.5">
                <div
                  className={`text-xs font-bold ${
                    isSelected ? 'text-sky-300' : 'text-slate-200'
                  }`}
                >
                  {day.isToday ? 'Oggi' : day.dayName.slice(0, 3)}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight num-tabular">
                  {day.date.slice(8, 10)}/{day.date.slice(5, 7)}
                </div>
              </div>

              {/* WMO Icon */}
              <div className="my-0.5">
                <WmoIcon className={`w-5 h-5 ${wmo.colorClass}`} />
              </div>

              {/* Min / Max & Rain mm */}
              <div className="text-center w-full num-tabular">
                <div className="text-xs font-bold text-white tracking-tight leading-none">
                  {formatTemperature(day.tempMax, preferences.roundTemperatures)}
                  <span className="text-[10px] font-normal text-slate-400 ml-1">
                    {formatTemperature(day.tempMin, preferences.roundTemperatures)}
                  </span>
                </div>
                <div className="text-[9px] text-cyan-300 font-medium mt-0.5 truncate h-3">
                  {hasRain ? `${day.precipitationSum} mm` : '0 mm'}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
