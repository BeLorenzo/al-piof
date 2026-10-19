import React, { useState } from 'react';
import { CloudRain, Radio, Maximize2, ShieldCheck, Zap } from 'lucide-react';
import { WindyRadarEmbed } from './WindyRadarEmbed';
import { NativeMapLibreRadar } from './NativeMapLibreRadar';
import type { Location } from '../../types/weather.types';

interface RadarSectionProps {
  location: Location;
  isPreview?: boolean;
  onExpand?: () => void;
}

export type MapMode = 'rain_forecast' | 'radar_dpc' | 'radar_windy';

export const RadarSection: React.FC<RadarSectionProps> = ({
  location,
  isPreview = false,
  onExpand,
}) => {
  const [mapMode, setMapMode] = useState<MapMode>('rain_forecast');

  const getSubtitle = () => {
    switch (mapMode) {
      case 'rain_forecast':
        return 'Previsione pioggia animate ECMWF (timeline con Play)';
      case 'radar_dpc':
        return 'Radar nazionale VMI Protezione Civile (tempo reale)';
      case 'radar_windy':
        return 'Doppler radar nowcast ad alta risoluzione (tempo reale)';
    }
  };

  return (
    <div className={`w-full ${isPreview ? 'p-4' : 'px-4 py-2'} space-y-3`}>
      {/* Header and Layer Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-sky-950/60 border border-sky-800/60 text-sky-400">
            {mapMode === 'rain_forecast' ? (
              <CloudRain className="w-4 h-4 text-sky-400" />
            ) : (
              <Radio className="w-4 h-4 animate-pulse text-emerald-400" />
            )}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-100 flex items-center gap-1.5">
              <span>Mappa Previsioni & Radar</span>
              {isPreview && (
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-normal">
                  Anteprima
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400">
              {getSubtitle()}
            </div>
          </div>
        </div>

        {/* Engine Toggle Buttons */}
        {!isPreview && (
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs overflow-x-auto no-scrollbar">
            <button
              onClick={() => setMapMode('rain_forecast')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 shrink-0 ${
                mapMode === 'rain_forecast'
                  ? 'bg-sky-500 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              type="button"
            >
              <CloudRain className="w-3 h-3" />
              <span>Previsione</span>
            </button>
            <button
              onClick={() => setMapMode('radar_dpc')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 shrink-0 ${
                mapMode === 'radar_dpc'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              type="button"
            >
              <ShieldCheck className="w-3 h-3" />
              <span>Radar DPC</span>
            </button>
            <button
              onClick={() => setMapMode('radar_windy')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors flex items-center gap-1 shrink-0 ${
                mapMode === 'radar_windy'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              type="button"
            >
              <Zap className="w-3 h-3" />
              <span>Radar Live</span>
            </button>
          </div>
        )}
      </div>

      {/* Map Container with Anti Scroll-Trap for Preview */}
      <div className="relative rounded-2xl overflow-hidden border border-slate-800/80 bg-slate-950 shadow-xl">
        <div className={isPreview ? 'pointer-events-none' : ''}>
          {mapMode === 'rain_forecast' && (
            <WindyRadarEmbed
              location={location}
              heightClass={isPreview ? 'h-[240px]' : 'h-[500px]'}
              mode="rain"
            />
          )}
          {mapMode === 'radar_windy' && (
            <WindyRadarEmbed
              location={location}
              heightClass={isPreview ? 'h-[240px]' : 'h-[500px]'}
              mode="radar"
            />
          )}
          {mapMode === 'radar_dpc' && (
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
              <span>Espandi Mappa & Radar Full Screen</span>
            </button>
          </div>
        )}
      </div>

      {/* Radar Reflectivity Scale Legend */}
      {!isPreview && (
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 text-[11px] text-slate-300 flex items-center justify-between gap-2">
          <span className="text-slate-400 font-medium">Scala Intensità:</span>
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
              Temporale/Grandine
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
