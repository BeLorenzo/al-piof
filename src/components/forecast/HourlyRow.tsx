import React from 'react';
import { ChevronDown, ArrowUp, Droplets } from 'lucide-react';
import { getWmoInfo } from '../../utils/wmoCodes';
import { getWindArrowStyle, getWindDirection } from '../../utils/windUtils';
import { formatTemperature, formatWindSpeed } from '../../utils/meteoMath';
import { HourlyAccordionDetails } from './HourlyAccordionDetails';
import { useAppStore } from '../../store/useAppStore';
import type { HourlyRowData } from '../../types/weather.types';

interface HourlyRowProps {
  row: HourlyRowData;
  isCurrentHour: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

export const HourlyRow: React.FC<HourlyRowProps> = ({
  row,
  isCurrentHour,
  isExpanded,
  onToggle,
}) => {
  const preferences = useAppStore((state) => state.preferences);
  const hourNum = parseInt(row.hour.split(':')[0], 10);
  const isDay = hourNum >= 6 && hourNum < 20;
  const wmo = getWmoInfo(row.weatherCode, isDay);
  const WmoIcon = wmo.icon;
  const windDir = getWindDirection(row.windDirection);

  const isCompact = preferences.compactHourlyRows;

  return (
    <div
      id={`hour-row-${hourNum}`}
      className={`border-b border-slate-800/60 transition-colors ${
        isCurrentHour
          ? 'bg-sky-950/30 border-l-2 border-l-sky-400'
          : isExpanded
          ? 'bg-slate-900/60'
          : 'hover:bg-slate-900/30'
      }`}
    >
      {/* 5-Column Row */}
      <div
        onClick={onToggle}
        className={`grid grid-cols-[58px_1fr_56px_66px_60px_16px] items-center px-3 cursor-pointer select-none text-xs gap-1.5 transition-all duration-150 ${
          isCompact ? 'py-1.5' : 'py-2.5'
        } ${
          isCurrentHour
            ? 'bg-sky-500/10'
            : isExpanded
            ? 'bg-slate-800/40'
            : 'hover:bg-slate-800/25 active:bg-slate-800/40'
        }`}
      >
        {/* Col 1: Ora + Badge Affidabilità */}
        <div className="flex flex-col items-start justify-center">
          <div className="flex items-center gap-1.5">
            <span
              className={`text-[13px] font-bold tracking-tight num-tabular ${
                isCurrentHour ? 'text-sky-300' : 'text-slate-100'
              }`}
            >
              {row.hour}
            </span>
            {row.comparison && (
              <span
                className={`w-2 h-2 rounded-full shrink-0 shadow-sm ${row.comparison.dotColorClass}`}
                title={`Affidabilità ore ${row.hour}: ${row.comparison.overallReliability} (${row.comparison.overallScore}%)`}
              />
            )}
          </div>
          {isCurrentHour && (
            <span className="text-[8px] tracking-wider px-1 py-0.2 rounded bg-sky-500/25 text-sky-300 font-extrabold uppercase mt-0.5">
              ORA
            </span>
          )}
        </div>

        {/* Col 2: Icona + Condizione */}
        <div className="flex items-center gap-2 min-w-0 pr-1">
          <div className="p-1 rounded-lg bg-slate-800/60 shrink-0">
            <WmoIcon className={`w-4 h-4 ${wmo.colorClass}`} />
          </div>
          <span className="truncate text-slate-300 text-[11px] font-medium">
            {wmo.label}
          </span>
        </div>

        {/* Col 3: Temp (Percepita) */}
        <div className="text-right flex flex-col items-end num-tabular">
          <span className="font-bold text-white text-[14px] leading-tight">
            {formatTemperature(row.temperature, preferences.roundTemperatures)}
          </span>
          <span className="text-[10px] text-slate-500 leading-none">
            {formatTemperature(row.apparentTemperature, preferences.roundTemperatures)}
          </span>
        </div>

        {/* Col 4: Pioggia (% + mm) */}
        <div className="text-right flex flex-col items-end num-tabular">
          {row.precipitation > 0 ? (
            <div className="flex items-center gap-1 text-cyan-300 font-semibold text-[11px]">
              <Droplets className="w-2.5 h-2.5 shrink-0" />
              <span>{row.precipitation} mm</span>
            </div>
          ) : (
            <span className="text-slate-600 text-[11px] font-normal">0 mm</span>
          )}
          <span
            className={`text-[9px] ${
              row.precipitationProbability > 20
                ? 'text-cyan-400 font-medium'
                : 'text-slate-500'
            }`}
          >
            {row.precipitationProbability}%
          </span>
        </div>

        {/* Col 5: Vento (km/h + Freccia) */}
        <div className="flex items-center justify-end gap-1 text-right text-slate-300 num-tabular">
          <div className="leading-tight">
            <span className="font-semibold text-[11px] text-slate-300">
              {formatWindSpeed(row.windSpeed, preferences.windUnit)}
            </span>
            <span className="text-[9px] text-slate-500 block">
              {windDir}
            </span>
          </div>
          <span
            style={getWindArrowStyle(row.windDirection)}
            className="text-cyan-400 shrink-0"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Accordion Chevron */}
        <div className="flex justify-end text-slate-500">
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform duration-200 ${
              isExpanded ? 'rotate-180 text-sky-400' : 'text-slate-600'
            }`}
          />
        </div>
      </div>

      {/* Accordion Clean Breakdown */}
      {isExpanded && <HourlyAccordionDetails row={row} />}
    </div>
  );
};
