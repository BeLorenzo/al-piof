import React from 'react';
import {
  Mountain,
  Droplets,
  Cloud,
  Wind,
  Sun,
  Leaf,
  Thermometer,
} from 'lucide-react';
import { getEaqiInfo } from '../../utils/aqiScale';
import { getUvInfo, formatWindSpeed } from '../../utils/meteoMath';
import { useAppStore } from '../../store/useAppStore';
import type { HourlyRowData } from '../../types/weather.types';

interface HourlyAccordionDetailsProps {
  row: HourlyRowData;
}

export const HourlyAccordionDetails: React.FC<HourlyAccordionDetailsProps> = ({ row }) => {
  const preferences = useAppStore((state) => state.preferences);
  const aqiInfo = getEaqiInfo(row.europeanAqi);
  const uvInfo = getUvInfo(row.uvIndex);

  return (
    <div className="px-3 pb-3 pt-2 grid grid-cols-3 gap-2 bg-slate-950/70 text-[11px] border-t border-slate-800/60 animate-fade-in num-tabular">
      <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/80">
        <div className="flex items-center gap-1 text-slate-400 text-[10px]">
          <Mountain className="w-3 h-3 text-sky-400" />
          <span>Zero Termico</span>
        </div>
        <div className="font-bold text-slate-200 mt-0.5">{row.freezingLevel} m</div>
      </div>

      <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/80">
        <div className="flex items-center gap-1 text-slate-400 text-[10px]">
          <Thermometer className="w-3 h-3 text-cyan-400" />
          <span>P. Rugiada</span>
        </div>
        <div className="font-bold text-slate-200 mt-0.5">{row.dewPoint}&deg;C</div>
      </div>

      <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/80">
        <div className="flex items-center gap-1 text-slate-400 text-[10px]">
          <Droplets className="w-3 h-3 text-blue-400" />
          <span>Umidità</span>
        </div>
        <div className="font-bold text-slate-200 mt-0.5">{row.relativeHumidity}%</div>
      </div>

      <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/80">
        <div className="flex items-center gap-1 text-slate-400 text-[10px]">
          <Cloud className="w-3 h-3 text-slate-400" />
          <span>Copertura</span>
        </div>
        <div className="font-bold text-slate-200 mt-0.5">{row.cloudCover}%</div>
      </div>

      <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/80">
        <div className="flex items-center gap-1 text-slate-400 text-[10px]">
          <Wind className="w-3 h-3 text-cyan-400" />
          <span>Raffica Max</span>
        </div>
        <div className="font-bold text-slate-200 mt-0.5">
          {formatWindSpeed(row.windGusts, preferences.windUnit)}
        </div>
      </div>

      <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/80">
        <div className="flex items-center gap-1 text-slate-400 text-[10px]">
          <Sun className="w-3 h-3 text-amber-400" />
          <span>Indice UV</span>
        </div>
        <div className="font-bold text-slate-200 mt-0.5">
          {uvInfo.ratioText} ({uvInfo.label})
        </div>
      </div>

      {/* Multi-Model Comparison & Reliability */}
      {row.comparison && (
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 col-span-3 space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="font-semibold flex items-center gap-1.5">
              <span className={`w-2 h-2 rounded-full ${row.comparison.dotColorClass}`} />
              Confronto Modelli ({row.comparison.overallReliability} &bull; {row.comparison.overallScore}%)
            </span>
            <span className="text-[10px] text-slate-400">
              Spread &Delta; {row.comparison.temperature.spread}&deg;C ({row.comparison.temperature.agreement})
            </span>
          </div>

          <div className="grid grid-cols-3 gap-1.5 text-center text-[10px]">
            {row.comparison.temperature.values.map((v) => (
              <div key={v.modelId} className="p-1 rounded bg-slate-950/70 border border-slate-800/80">
                <span className="text-slate-400 block truncate">{v.modelName}</span>
                <strong className="text-slate-100 text-[11px]">{v.value}&deg;C</strong>
              </div>
            ))}
          </div>

          {row.comparison.temperature.average != null && (
            <div className="text-[10px] text-sky-300 font-medium text-center bg-sky-950/40 rounded py-0.5 border border-sky-800/40">
              Media calcolata (se Blend attivo): <strong>{row.comparison.temperature.average}&deg;C</strong>
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5 border-t border-slate-800/50">
            <span>Pioggia modelli:</span>
            <span className="text-cyan-300 font-medium">
              {row.comparison.rain.concordanceLabel}
            </span>
          </div>
        </div>
      )}

      {/* Qualità Aria */}
      <div className="p-2 rounded-lg bg-slate-900/40 border border-slate-800/80 col-span-3 flex items-center justify-between">
        <div className="flex items-center gap-1 text-slate-400 text-[10px]">
          <Leaf className="w-3 h-3 text-emerald-400" />
          <span>Qualità Aria (EAQI):</span>
        </div>
        <div className={`font-bold ${aqiInfo.colorClass}`}>
          {row.europeanAqi !== null ? `${row.europeanAqi} - ${aqiInfo.label}` : 'N/D'}
        </div>
      </div>
    </div>
  );
};
