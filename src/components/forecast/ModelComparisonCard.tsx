import React, { useState } from 'react';
import { Scale, ChevronDown, CheckCircle2, AlertTriangle, AlertCircle, Droplets, Thermometer } from 'lucide-react';
import type { DayModelComparison } from '../../types/weather.types';

interface ModelComparisonCardProps {
  comparison?: DayModelComparison;
  dayName: string;
}

export const ModelComparisonCard: React.FC<ModelComparisonCardProps> = ({
  comparison,
  dayName,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!comparison) {
    return (
      <div className="p-3 rounded-2xl bg-slate-900/50 border border-slate-800/60 text-xs text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-slate-500" />
          <span>Confronto modelli: orizzonte oltre i 5 giorni (solo modello base attivo)</span>
        </div>
      </div>
    );
  }

  const { tempMax, tempMin, rain, overallReliability, overallScore } = comparison;

  const StatusIcon =
    overallReliability === 'Alta'
      ? CheckCircle2
      : overallReliability === 'Media'
      ? AlertTriangle
      : AlertCircle;

  return (
    <div className="overflow-hidden rounded-2xl bg-slate-900/75 border border-slate-800/80 shadow-lg backdrop-blur-md transition-all">
      {/* Header clickable button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-3 flex items-center justify-between hover:bg-slate-800/30 transition-colors text-left"
        type="button"
      >
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-xl bg-slate-950/60 border border-slate-800 text-sky-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
              <span>Affidabilità Modelli Meteo</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-md font-bold flex items-center gap-1 ${
                  overallReliability === 'Alta'
                    ? 'bg-emerald-950/70 text-emerald-400 border border-emerald-800/80'
                    : overallReliability === 'Media'
                    ? 'bg-yellow-950/70 text-yellow-400 border border-yellow-800/80'
                    : 'bg-orange-950/70 text-orange-400 border border-orange-800/80'
                }`}
              >
                <StatusIcon className="w-3 h-3" />
                {overallReliability} ({overallScore}%)
              </span>
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
              <span>Confronto MeteoSwiss, ECMWF e ICON-D2 per {dayName}</span>
              {comparison.leadTimeHorizon && (
                <span className="text-[10px] text-sky-400 font-medium">
                  &bull; {comparison.leadTimeHorizon}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-slate-400">
          <span className="text-[11px] font-medium text-sky-400 hidden sm:inline">
            {isExpanded ? 'Chiudi' : 'Dettagli'}
          </span>
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${
              isExpanded ? 'rotate-180 text-sky-400' : 'text-slate-400'
            }`}
          />
        </div>
      </button>

      {/* Expanded Comparison Breakdown */}
      {isExpanded && (
        <div className="px-3 pb-3 pt-2 border-t border-slate-800/60 space-y-2.5 text-xs animate-fade-in bg-slate-950/40">
          {/* Horizon info note */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Orizzonte temporale:</span>
            <span className="font-semibold text-sky-300">{comparison.leadTimeHorizon}</span>
          </div>

          {/* 1. Temp Max Comparison */}
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/70">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                <Thermometer className="w-3.5 h-3.5 text-rose-400" />
                <span>Temperatura Massima</span>
              </div>
              <div className="text-[11px] font-medium text-slate-400">
                Spread: <strong className="text-white">&Delta; {tempMax.spread}&deg;C</strong> ({tempMax.agreement})
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              {tempMax.values.map((v) => (
                <div key={v.modelId} className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 font-medium truncate">{v.modelName}</div>
                  <div className="text-sm font-bold text-slate-100">{v.value}&deg;C</div>
                </div>
              ))}
            </div>
            {tempMax.average != null && (
              <div className="mt-1.5 py-1 px-2 rounded-lg bg-rose-950/40 border border-rose-800/40 text-[10px] text-rose-300 flex items-center justify-between">
                <span>Media applicata:</span>
                <span className="font-bold text-xs">{tempMax.average}&deg;C</span>
              </div>
            )}
          </div>

          {/* 2. Temp Min Comparison */}
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/70">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                <Thermometer className="w-3.5 h-3.5 text-sky-400" />
                <span>Temperatura Minima</span>
              </div>
              <div className="text-[11px] font-medium text-slate-400">
                Spread: <strong className="text-white">&Delta; {tempMin.spread}&deg;C</strong> ({tempMin.agreement})
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              {tempMin.values.map((v) => (
                <div key={v.modelId} className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 font-medium truncate">{v.modelName}</div>
                  <div className="text-sm font-bold text-slate-100">{v.value}&deg;C</div>
                </div>
              ))}
            </div>
            {tempMin.average != null && (
              <div className="mt-1.5 py-1 px-2 rounded-lg bg-sky-950/40 border border-sky-800/40 text-[10px] text-sky-300 flex items-center justify-between">
                <span>Media applicata:</span>
                <span className="font-bold text-xs">{tempMin.average}&deg;C</span>
              </div>
            )}
          </div>

          {/* 3. Rain Concordance */}
          <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/70">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5 font-semibold text-slate-200">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span>Precipitazioni Previste</span>
              </div>
              <div className="text-[11px] font-medium text-cyan-300">
                {rain.concordanceLabel}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-center">
              {rain.values.map((v) => (
                <div key={v.modelId} className="p-1.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                  <div className="text-[10px] text-slate-400 font-medium truncate">{v.modelName}</div>
                  <div className={`text-sm font-bold ${v.value > 0 ? 'text-cyan-300' : 'text-slate-400'}`}>
                    {v.value} mm
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
