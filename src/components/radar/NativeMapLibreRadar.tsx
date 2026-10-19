import React, { useEffect, useRef, useState } from 'react';
import maplibregl, { Map as MapLibreMap, Marker } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Navigation, Sliders, Layers } from 'lucide-react';
import type { Location } from '../../types/weather.types';

interface NativeMapLibreRadarProps {
  location: Location;
  heightClass?: string;
}

const CARTO_DARK_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';
const DPC_WMS_TILE_URL =
  'https://radar-geowebcache.protezionecivile.it/service/wms?SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&FORMAT=image/png&TRANSPARENT=true&LAYERS=it:VMI&SRS=EPSG:3857&WIDTH=256&HEIGHT=256&BBOX={bbox-epsg-3857}';

export const NativeMapLibreRadar: React.FC<NativeMapLibreRadarProps> = ({
  location,
  heightClass = 'h-[460px]',
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<MapLibreMap | null>(null);
  const markerRef = useRef<Marker | null>(null);

  const [opacity, setOpacity] = useState<number>(0.75);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: CARTO_DARK_STYLE,
      center: [location.longitude, location.latitude],
      zoom: 8.5,
      attributionControl: false,
    });

    mapInstanceRef.current = map;

    map.on('load', () => {
      // Add DPC WMS Raster Source
      map.addSource('dpc-radar-source', {
        type: 'raster',
        tiles: [DPC_WMS_TILE_URL],
        tileSize: 256,
      });

      // Add DPC WMS Raster Layer
      map.addLayer({
        id: 'dpc-radar-layer',
        type: 'raster',
        source: 'dpc-radar-source',
        paint: {
          'raster-opacity': opacity,
        },
      });

      // Add custom location marker
      const markerEl = document.createElement('div');
      markerEl.className = 'w-4 h-4 rounded-full bg-sky-400 border-2 border-white shadow-lg animate-pulse';

      const marker = new maplibregl.Marker({ element: markerEl })
        .setLngLat([location.longitude, location.latitude])
        .addTo(map);

      markerRef.current = marker;
      setIsLoaded(true);
    });

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [location.latitude, location.longitude]);

  // Update opacity dynamically
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (map && isLoaded && map.getLayer('dpc-radar-layer')) {
      map.setPaintProperty('dpc-radar-layer', 'raster-opacity', opacity);
    }
  }, [opacity, isLoaded]);

  const handleRecenter = () => {
    mapInstanceRef.current?.flyTo({
      center: [location.longitude, location.latitude],
      zoom: 8.5,
      essential: true,
      duration: 1000,
    });
  };

  return (
    <div className={`w-full ${heightClass} relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-950`}>
      <div ref={mapContainerRef} className="w-full h-full" />

      {/* Map Floating Controls */}
      <div className="absolute top-2.5 right-2.5 flex flex-col gap-2 z-10">
        <button
          onClick={handleRecenter}
          className="p-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-sky-400 border border-slate-700/80 shadow-lg backdrop-blur-md transition-colors"
          title="Ricomponi su posizione attiva"
          type="button"
        >
          <Navigation className="w-4 h-4" />
        </button>
      </div>

      {/* Opacity Control Pill */}
      <div className="absolute bottom-2.5 left-2.5 right-2.5 z-10 flex items-center justify-between px-3 py-2 rounded-xl bg-slate-950/85 border border-slate-800/90 shadow-xl backdrop-blur-md text-xs text-slate-300">
        <div className="flex items-center gap-1.5 font-medium">
          <Layers className="w-3.5 h-3.5 text-sky-400" />
          <span>DPC VMI Nazionale</span>
        </div>

        <div className="flex items-center gap-2">
          <Sliders className="w-3 h-3 text-slate-400" />
          <input
            type="range"
            min="0.2"
            max="1.0"
            step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className="w-20 accent-sky-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          <span className="text-[10px] text-slate-400 font-mono w-7 text-right">
            {Math.round(opacity * 100)}%
          </span>
        </div>
      </div>
    </div>
  );
};
