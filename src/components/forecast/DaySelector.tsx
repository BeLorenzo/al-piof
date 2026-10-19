import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getWmoInfo } from '../../utils/wmoCodes';
import type { DailyForecastData } from '../../types/weather.types';

interface DaySelectorProps {
  days: DailyForecastData[];
}

export const DaySelector: React.FC<DaySelectorProps> = ({ days }) => {
  const { selectedDayIndex, setSelectedDayIndex } = useAppStore();

  return (
    <div className="w-full bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80 py-2.5 px-4 sticky top-[138px] z-30">
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-0.5">
        {days.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;
          const wmo = getWmoInfo(day.weatherCode, true);
          const WmoIcon = wmo.icon;
          const hasRain = day.precipitationSum > 0;

          return (
            <button
              key={day.date}
              onClick={() => setSelectedDayIndex(idx)}
              className={`shrink-0 flex flex-col items-center justify-between p-2 rounded-2xl border transition-all w-[70px] h-[106px] relative select-none ${
                isSelected
                  ? 'bg-slate-800/90 border-sky-500 shadow-md shadow-sky-950 text-white'
                  : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              {/* Rain dot indicator */}
              {hasRain && (
                <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-cyan-400 ring-2 ring-cyan-950" />
              )}

              {/* Day title */}
              <div className="text-center">
                <div
                  className={`text-xs font-bold ${
                    isSelected ? 'text-sky-300' : 'text-slate-200'
                  }`}
                >
                  {day.isToday ? 'Oggi' : day.dayName.slice(0, 3)}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight">
                  {day.date.slice(8, 10)}/{day.date.slice(5, 7)}
                </div>
              </div>

              {/* WMO Icon */}
              <div className="my-1">
                <WmoIcon className={`w-6 h-6 ${wmo.colorClass}`} />
              </div>

              {/* Min / Max & Rain mm */}
              <div className="text-center w-full">
                <div className="text-xs font-bold text-white tracking-tight leading-none">
                  {day.tempMax}°
                  <span className="text-[10px] font-normal text-slate-400 ml-1">
                    {day.tempMin}°
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
