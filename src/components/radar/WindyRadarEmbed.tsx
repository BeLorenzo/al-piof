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

  const windyUrl = `https://embed.windy.com/embed2.html?lat=${latitude}&lon=${longitude}&detailLat=${latitude}&detailLon=${longitude}&zoom=${zoom}&level=surface&overlay=${overlay}&product=${product}&menu=&message=&marker=true&calendar=now&type=map&location=coordinates&detail=&metricRain=mm&metricTemp=°C&metricWind=km/h`;

  return (
    <div className={`w-full ${heightClass} relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-xl`}>
      {/* Floating location indicator badge */}
      <div className="absolute top-2.5 left-2.5 z-10 pointer-events-none flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-950/85 backdrop-blur-md border border-slate-700/80 text-[11px] font-semibold text-slate-100 shadow-lg">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500" />
        </span>
        <span>{location.name}</span>
      </div>

      <iframe
        title={`Mappa Windy - ${mode === 'rain' ? 'Previsione Pioggia' : 'Radar Live'} - ${location.name}`}
        src={windyUrl}
        className="w-full h-full border-0 rounded-2xl"
        loading="lazy"
        allow="geolocation"
      />
    </div>
  );
};
