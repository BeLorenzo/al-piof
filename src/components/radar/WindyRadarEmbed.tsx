import React, { useState } from 'react';
import { CloudRain, Radio, Thermometer, Wind, Cloud } from 'lucide-react';
import type { Location } from '../../types/weather.types';

export type WindyLayer = 'rain' | 'radar' | 'temp' | 'wind' | 'clouds';

interface WindyRadarEmbedProps {
  location: Location;
  heightClass?: string;
  defaultLayer?: WindyLayer;
}

export const WindyRadarEmbed: React.FC<WindyRadarEmbedProps> = ({
  location,
  heightClass = 'h-[460px]',
  defaultLayer = 'rain',
}) => {
  const { latitude, longitude } = location;
  const [currentLayer, setCurrentLayer] = useState<WindyLayer>(defaultLayer);

  const product = currentLayer === 'radar' ? 'radar' : 'ecmwf';
  const zoom = currentLayer === 'radar' ? 9 : 8;

  const windyUrl = `https://embed.windy.com/embed2.html?lat=${latitude}&lon=${longitude}&zoom=${zoom}&level=surface&overlay=${currentLayer}&product=${product}&menu=&message=&calendar=now&type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=km/h`;

  return (
    <div className="w-full space-y-2">
      {/* Selettore rapido dei layer a portata di pollice */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button
          onClick={() => setCurrentLayer('rain')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1 transition-all ${
            currentLayer === 'rain'
              ? 'bg-sky-500 text-white shadow-sm font-semibold'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          type="button"
        >
          <CloudRain className="w-3 h-3" />
          <span>Previsione Pioggia</span>
        </button>
        <button
          onClick={() => setCurrentLayer('radar')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1 transition-all ${
            currentLayer === 'radar'
              ? 'bg-emerald-600 text-white shadow-sm font-semibold'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          type="button"
        >
          <Radio className="w-3 h-3" />
          <span>Radar Live</span>
        </button>
        <button
          onClick={() => setCurrentLayer('temp')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1 transition-all ${
            currentLayer === 'temp'
              ? 'bg-amber-600 text-white shadow-sm font-semibold'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          type="button"
        >
          <Thermometer className="w-3 h-3" />
          <span>Temperatura</span>
        </button>
        <button
          onClick={() => setCurrentLayer('wind')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1 transition-all ${
            currentLayer === 'wind'
              ? 'bg-cyan-600 text-white shadow-sm font-semibold'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          type="button"
        >
          <Wind className="w-3 h-3" />
          <span>Vento</span>
        </button>
        <button
          onClick={() => setCurrentLayer('clouds')}
          className={`px-2.5 py-1 rounded-lg text-xs font-medium shrink-0 flex items-center gap-1 transition-all ${
            currentLayer === 'clouds'
              ? 'bg-indigo-600 text-white shadow-sm font-semibold'
              : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200'
          }`}
          type="button"
        >
          <Cloud className="w-3 h-3" />
          <span>Nuvole</span>
        </button>
      </div>

      {/* Contenitore Mappa */}
      <div className={`w-full ${heightClass} relative overflow-hidden rounded-3xl border border-slate-800 bg-slate-950 shadow-xl card-surface`}>
        {/* Puntino centrale sul paese */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20 flex flex-col items-center">
          <div className="px-2 py-0.5 rounded-full bg-slate-950/90 border border-slate-700/80 text-[10px] font-bold text-slate-100 shadow-md mb-1 whitespace-nowrap flex items-center gap-1 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>{location.name}</span>
          </div>
          <div className="relative flex items-center justify-center">
            <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-rose-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-white shadow-lg" />
          </div>
        </div>

        {/* Schermo protettivo: impedisce lo spostamento accidentale mantenendo il puntino della città perfettamente allineato */}
        <div className="absolute inset-0 top-[60px] right-[60px] bottom-[64px] z-10 cursor-default" />

        <iframe
          title={`Mappa Windy - ${location.name}`}
          src={windyUrl}
          className="w-full h-full border-0 rounded-3xl"
          loading="lazy"
          allow="geolocation"
        />
      </div>
    </div>
  );
};
