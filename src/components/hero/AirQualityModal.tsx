import React from 'react';
import { X, Wind, Flower2, Leaf } from 'lucide-react';
import type { AirQualityData } from '../../types/weather.types';

interface AirQualityModalProps {
  isOpen: boolean;
  onClose: () => void;
  airQuality: AirQualityData | null;
}

export const AirQualityModal: React.FC<AirQualityModalProps> = ({
  isOpen,
  onClose,
  airQuality,
}) => {
  if (!isOpen || !airQuality) return null;

  const pollenList = [
    { name: 'Betulla', value: airQuality.pollen.birch, unit: 'gr/m³' },
    { name: 'Graminacee', value: airQuality.pollen.grass, unit: 'gr/m³' },
    { name: 'Ontano', value: airQuality.pollen.alder, unit: 'gr/m³' },
    { name: 'Artemisia', value: airQuality.pollen.mugwort, unit: 'gr/m³' },
    { name: 'Ulivo', value: airQuality.pollen.olive, unit: 'gr/m³' },
    { name: 'Ambrosia', value: airQuality.pollen.ragweed, unit: 'gr/m³' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] card-surface">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Leaf className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-white tracking-tight">Qualità dell&apos;Aria &amp; Pollini</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            type="button"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Main EAQI banner */}
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400">Indice EAQI Europeo (CAMS)</div>
              <div className="text-2xl font-black text-white mt-0.5 num-tabular">
                {airQuality.europeanAqi}{' '}
                <span className={`text-sm font-semibold ${airQuality.colorClass}`}>
                  ({airQuality.label})
                </span>
              </div>
            </div>
            <div
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold num-tabular ${airQuality.colorClass} border-current/40 bg-slate-900/80`}
            >
              EAQI {airQuality.europeanAqi}
            </div>
          </div>

          {/* Particulates Grid */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              <Wind className="w-3.5 h-3.5 text-sky-400" />
              <span>Inquinanti Principali</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl num-tabular">
                <div className="text-slate-400 text-[11px]">PM 2.5 (Fine)</div>
                <div className="text-base font-bold text-slate-100 mt-0.5">
                  {airQuality.pm25} <span className="text-[10px] text-slate-500 font-normal">µg/m³</span>
                </div>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl num-tabular">
                <div className="text-slate-400 text-[11px]">PM 10 (Inalabile)</div>
                <div className="text-base font-bold text-slate-100 mt-0.5">
                  {airQuality.pm10} <span className="text-[10px] text-slate-500 font-normal">µg/m³</span>
                </div>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl num-tabular">
                <div className="text-slate-400 text-[11px]">Biossido Azoto (NO₂)</div>
                <div className="text-base font-bold text-slate-100 mt-0.5">
                  {airQuality.nitrogenDioxide} <span className="text-[10px] text-slate-500 font-normal">µg/m³</span>
                </div>
              </div>
              <div className="p-3 bg-slate-950/40 border border-slate-800/80 rounded-xl num-tabular">
                <div className="text-slate-400 text-[11px]">Ozono (O₃)</div>
                <div className="text-base font-bold text-slate-100 mt-0.5">
                  {airQuality.ozone} <span className="text-[10px] text-slate-500 font-normal">µg/m³</span>
                </div>
              </div>
            </div>
          </div>

          {/* Pollen Section */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              <Flower2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Concentrazione Pollini (CAMS)</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {pollenList.map((p) => (
                <div
                  key={p.name}
                  className="p-2.5 bg-slate-950/40 border border-slate-800/80 rounded-xl flex items-center justify-between num-tabular"
                >
                  <span className="text-slate-300">{p.name}</span>
                  <span className="font-semibold text-slate-100">
                    {p.value}{' '}
                    <span className="text-[9px] text-slate-500 font-normal">
                      {p.unit}
                    </span>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
