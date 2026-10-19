import React from 'react';
import type { Location } from '../../types/weather.types';

export type WindyMapMode = 'rain' | 'radar';

interface WindyRadarEmbedProps {
  location: Location;
  heightClass?: string;
  mode?: WindyMapMode;
}

export const WindyRadarEmbed: React.FC<WindyRadarEmbedProps> = ({
  location,
  heightClass = 'h-[460px]',
  mode = 'rain',
}) => {
  const { latitude, longitude } = location;

  // 'rain' = Previsione pioggia ECMWF con player temporale giorni futuri
  // 'radar' = Nowcast radar Doppler in tempo reale
  const overlay = mode === 'radar' ? 'radar' : 'rain';
  const product = mode === 'radar' ? 'radar' : 'ecmwf';
  const zoom = mode === 'radar' ? 9 : 8;

  // URL pulito: rimosso 'detail=' per impedire l'apertura del pannello mini-meteo
  const windyUrl = `https://embed.windy.com/embed2.html?lat=${latitude}&lon=${longitude}&zoom=${zoom}&level=surface&overlay=${overlay}&product=${product}&menu=&message=&calendar=now&type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=km/h`;

  return (
    <div className={`w-full ${heightClass} relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-xl`}>
      {/* Puntino centrale elegante sul paese (non cliccabile, zero popup fastidiosi) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 flex flex-col items-center">
        <div className="px-2 py-0.5 rounded-full bg-slate-950/90 border border-slate-700/80 text-[10px] font-bold text-slate-100 shadow-md mb-1 whitespace-nowrap flex items-center gap-1 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          <span>{location.name}</span>
        </div>
        <div className="relative flex items-center justify-center">
          <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500 border-2 border-white shadow-lg" />
        </div>
      </div>

      <iframe
        title={`Mappa Windy - ${location.name}`}
        src={windyUrl}
        className="w-full h-full border-0 rounded-2xl"
        loading="lazy"
        allow="geolocation"
      />
    </div>
  );
};
