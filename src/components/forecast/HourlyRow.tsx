import React from 'react';
import {
  ChevronDown,
  ArrowUp,
  Mountain,
  Droplets,
  Cloud,
  Wind,
  Sun,
  Sparkles,
} from 'lucide-react';
import { getWmoInfo } from '../../utils/wmoCodes';
import { getWindArrowStyle, getWindDirection } from '../../utils/windUtils';
import { getEaqiInfo } from '../../utils/aqiScale';
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
  const hourNum = parseInt(row.hour.split(':')[0], 10);
  const isDay = hourNum >= 6 && hourNum < 20;
  const wmo = getWmoInfo(row.weatherCode, isDay);
  const WmoIcon = wmo.icon;
  const windDir = getWindDirection(row.windDirection);
  const aqiInfo = getEaqiInfo(row.europeanAqi);

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
      {/* 5-Column Compact Row */}
      <div
        onClick={onToggle}
        className="grid grid-cols-[54px_1fr_64px_68px_60px_20px] items-center px-3 py-2.5 cursor-pointer select-none text-xs gap-1"
      >
        {/* Col 1: Ora */}
        <div>
          <div className="font-bold text-slate-100">{row.hour}</div>
          {isCurrentHour && (
            <span className="text-[9px] px-1 py-0.2 rounded bg-sky-500/20 text-sky-300 font-semibold leading-none">
              ORA
            </span>
          )}
        </div>

        {/* Col 2: Icona + Condizione */}
        <div className="flex items-center gap-1.5 min-w-0 pr-1">
          <WmoIcon className={`w-4 h-4 shrink-0 ${wmo.colorClass}`} />
          <span className="truncate text-slate-300 text-[11px] font-medium">
            {wmo.label}
          </span>
        </div>

        {/* Col 3: Temp (Percepita) */}
        <div className="text-right">
          <span className="font-bold text-white text-[13px]">{row.temperature}°</span>
          <span className="text-[10px] text-slate-400 block leading-tight">
            ({row.apparentTemperature}°)
          </span>
        </div>

        {/* Col 4: Pioggia (% + mm) */}
        <div className="text-right">
          <div
            className={`font-semibold text-[11px] ${
              row.precipitation > 0 ? 'text-cyan-300' : 'text-slate-500'
            }`}
          >
            {row.precipitation > 0 ? `${row.precipitation} mm` : '0 mm'}
          </div>
          <div className="text-[10px] text-slate-400 leading-tight">
            {row.precipitationProbability}%
          </div>
        </div>

        {/* Col 5: Vento (km/h + Freccia) */}
        <div className="flex items-center justify-end gap-1 text-right text-slate-300">
          <div>
            <span className="font-semibold text-[11px]">{row.windSpeed}</span>
            <span className="text-[9px] text-slate-500 block leading-tight">
              {windDir}
            </span>
          </div>
          <span style={getWindArrowStyle(row.windDirection)} className="text-cyan-400">
            <ArrowUp className="w-3.5 h-3.5" />
          </span>
        </div>

        {/* Accordion Chevron */}
        <div className="flex justify-end text-slate-500">
          <ChevronDown
            className={`w-3.5 h-3.5 transition-transform ${
              isExpanded ? 'rotate-180 text-sky-400' : ''
            }`}
          />
        </div>
      </div>

      {/* Accordion Expanded Detail */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-1 grid grid-cols-3 gap-2 bg-slate-950/50 text-[11px] border-t border-slate-800/40 animate-fade-in">
          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-1 text-slate-400 text-[10px]">
              <Mountain className="w-3 h-3 text-sky-400" />
              <span>Zero Termico</span>
            </div>
            <div className="font-bold text-slate-200 mt-0.5">
              {row.freezingLevel} m
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-1 text-slate-400 text-[10px]">
              <Droplets className="w-3 h-3 text-blue-400" />
              <span>Umidità</span>
            </div>
            <div className="font-bold text-slate-200 mt-0.5">
              {row.relativeHumidity}%
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-1 text-slate-400 text-[10px]">
              <Cloud className="w-3 h-3 text-slate-400" />
              <span>Copertura</span>
            </div>
            <div className="font-bold text-slate-200 mt-0.5">
              {row.cloudCover}%
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-1 text-slate-400 text-[10px]">
              <Wind className="w-3 h-3 text-cyan-400" />
              <span>Raffica Max</span>
            </div>
            <div className="font-bold text-slate-200 mt-0.5">
              {row.windGusts} km/h
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-1 text-slate-400 text-[10px]">
              <Sun className="w-3 h-3 text-amber-400" />
              <span>Indice UV</span>
            </div>
            <div className="font-bold text-slate-200 mt-0.5">
              {row.uvIndex}
            </div>
          </div>

          <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-1 text-slate-400 text-[10px]">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Aria (EAQI)</span>
            </div>
            <div className={`font-bold mt-0.5 ${aqiInfo.colorClass}`}>
              {row.europeanAqi !== null ? `${row.europeanAqi} (${aqiInfo.label})` : 'N/D'}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
