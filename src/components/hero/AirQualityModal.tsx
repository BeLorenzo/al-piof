import React from 'react';
import { X, Wind, Flower2, Leaf, Info } from 'lucide-react';
import type { AirQualityData } from '../../types/weather.types';

interface AirQualityModalProps {
  isOpen: boolean;
  onClose: () => void;
  airQuality: AirQualityData | null;
}

interface PollenMeta {
  name: string;
  season: string;
  value: number;
}

export const AirQualityModal: React.FC<AirQualityModalProps> = ({
  isOpen,
  onClose,
  airQuality,
}) => {
  if (!isOpen || !airQuality) return null;

  const pollenList: PollenMeta[] = [
    { name: 'Betulla', season: 'Mar - Mag', value: airQuality.pollen.birch },
    { name: 'Graminacee', season: 'Apr - Lug', value: airQuality.pollen.grass },
    { name: 'Ontano', season: 'Gen - Apr', value: airQuality.pollen.alder },
    { name: 'Artemisia', season: 'Lug - Ott', value: airQuality.pollen.mugwort },
    { name: 'Ulivo', season: 'Mag - Giu', value: airQuality.pollen.olive },
    { name: 'Ambrosia', season: 'Ago - Set', value: airQuality.pollen.ragweed },
  ];

  const getPollenStatus = (val: number) => {
    if (val === 0) return { label: 'Assente', color: 'text-slate-500 bg-slate-800/40' };
    if (val < 1) return { label: 'Tracce', color: 'text-emerald-400 bg-emerald-950/40' };
    if (val < 10) return { label: 'Basso', color: 'text-emerald-300 bg-emerald-950/60' };
    if (val < 50) return { label: 'Moderato', color: 'text-yellow-400 bg-yellow-950/60' };
    return { label: 'Elevato', color: 'text-rose-400 bg-rose-950/60' };
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] card-surface">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Leaf className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-100 tracking-tight">Qualità dell&apos;Aria &amp; Pollini</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition-colors"
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
              <div className="text-2xl font-black text-slate-100 mt-0.5 num-tabular">
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
            <div className="flex items-center justify-between text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              <div className="flex items-center gap-1.5">
                <Flower2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Concentrazione Pollini (CAMS)</span>
              </div>
              <span className="text-[10px] text-slate-400 lowercase font-normal">in gr/m³</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              {pollenList.map((p) => {
                const status = getPollenStatus(p.value);
                return (
                  <div
                    key={p.name}
                    className="p-2.5 bg-slate-950/40 border border-slate-800/80 rounded-xl flex flex-col justify-between num-tabular gap-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-200">{p.name}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between mt-0.5">
                      <span className="text-[10px] text-slate-500">Stagione: {p.season}</span>
                      <span className="font-bold text-slate-100 text-xs">
                        {p.value > 0 ? p.value : '0'} <span className="text-[9px] text-slate-500 font-normal">gr/m³</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Note informative scientifiche */}
            <div className="mt-2.5 p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-start gap-2 text-[11px] text-slate-400 leading-relaxed">
              <Info className="w-3.5 h-3.5 text-sky-400 shrink-0 mt-0.5" />
              <span>
                I pollini provengono dal modello CAMS Copernicus. In autunno e inverno le piante arboree ed erbacee sono in dormienza fenologica, per cui le concentrazioni rilevate sono naturalmente pari a zero o minime tracce.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
