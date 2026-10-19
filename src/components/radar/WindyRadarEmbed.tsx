import React from 'react';
import type { Location } from '../../types/weather.types';

interface WindyRadarEmbedProps {
  location: Location;
  heightClass?: string;
}

export const WindyRadarEmbed: React.FC<WindyRadarEmbedProps> = ({
  location,
  heightClass = 'h-[460px]',
}) => {
  const { latitude, longitude } = location;

  const windyUrl = `https://embed.windy.com/embed.html?type=map&location=coordinates&metricRain=mm&metricTemp=°C&metricWind=km/h&zoom=9&overlay=radar&product=radar&level=surface&lat=${latitude}&lon=${longitude}`;

  return (
    <div className={`w-full ${heightClass} relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950`}>
      <iframe
        title={`Radar Windy - ${location.name}`}
        src={windyUrl}
        className="w-full h-full border-0 rounded-2xl"
        loading="lazy"
        allow="geolocation"
      />
    </div>
  );
};
