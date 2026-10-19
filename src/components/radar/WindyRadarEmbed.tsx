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

  const windyUrl = `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=km/h&zoom=${zoom}&overlay=${overlay}&product=${product}&level=surface&lat=${latitude}&lon=${longitude}`;

  return (
    <div className={`w-full ${heightClass} relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950`}>
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
