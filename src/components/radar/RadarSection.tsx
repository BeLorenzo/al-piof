import React, { useState } from 'react';
import { Radio, Maximize2, ShieldCheck, Sparkles } from 'lucide-react';
import { WindyRadarEmbed } from './WindyRadarEmbed';
import { NativeMapLibreRadar } from './NativeMapLibreRadar';
import type { Location } from '../../types/weather.types';

interface RadarSectionProps {
  location: Location;
  isPreview?: boolean;
  onExpand?: () => void;
}

type RadarEngine = 'windy' | 'dpc';

export const RadarSection: React.FC<RadarSectionProps> = ({
  location,
  isPreview = false,
  onExpand,
}) => {
  const [engine, setEngine] = useState<RadarEngine>('windy');

  return (
    <div className={`w-full ${isPreview ? 'p-4' : 'px-4 py-2'} space-y-3`}>
      {/* Header and Engine Switcher */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-sky-950/60 border border-sky-800/60 text-sky-400">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>Radar Precipitazioni</span>
              {isPreview && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-normal">
                  Anteprima
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400">
              {engine === 'windy'
                ? 'Nowcast predittivo +1h ad alta risoluzione'
                : 'Composito Nazionale VMI Protezione Civile'}
            </div>
          </div>
        </div>

        {/* Engine Toggle Buttons */}
        {!isPreview && (
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <button
              onClick={() => setEngine('windy')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                engine === 'windy'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              type="button"
            >
              <Sparkles className="w-3 h-3" />
              <span>Windy</span>
            </button>
            <button
              onClick={() => setEngine('dpc')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 ${
                engine === 'dpc'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              type="button"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>DPC</span>
            </button>
          </div>
        )}
      </div>

      {/* Map Container with Anti Scroll-Trap for Preview */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-xl">
        <div className={isPreview ? 'pointer-events-none' : ''}>
          {engine === 'windy' ? (
            <WindyRadarEmbed
              location={location}
              heightClass={isPreview ? 'h-[240px]' : 'h-[500px]'}
            />
          ) : (
            <NativeMapLibreRadar
              location={location}
              heightClass={isPreview ? 'h-[240px]' : 'h-[500px]'}
            />
          )}
        </div>

        {/* Preview Overlay with Anti Scroll-Trap Button */}
        {isPreview && onExpand && (
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent flex items-end justify-center p-4">
            <button
              onClick={onExpand}
              className="w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
              type="button"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>Espandi Radar Interattivo Full Screen</span>
            </button>
          </div>
        )}
      </div>

      {/* Radar Reflectivity Scale Legend */}
      {!isPreview && (
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-300 flex items-center justify-between gap-2">
          <span className="text-slate-400 font-medium">Scala Pioggia:</span>
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px]">
              Debole
            </span>
            <span className="px-1.5 py-0.5 rounded bg-yellow-950 text-yellow-400 border border-yellow-800 text-[10px]">
              Moderata
            </span>
            <span className="px-1.5 py-0.5 rounded bg-orange-950 text-orange-400 border border-orange-800 text-[10px]">
              Forte
            </span>
            <span className="px-1.5 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-800 text-[10px]">
              Grandine
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
