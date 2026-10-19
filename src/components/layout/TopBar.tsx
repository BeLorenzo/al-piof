import React from 'react';
import {
  CloudRain,
  MapPin,
  Star,
  Navigation,
  Search,
  Loader2,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import type { WeatherModel, Location } from '../../types/weather.types';

interface TopBarProps {
  onOpenSearch: () => void;
}

const MODELS: { id: WeatherModel; label: string }[] = [
  { id: 'best_match', label: 'Auto (Blend)' },
  { id: 'meteoswiss_icon_ch2', label: 'MeteoSwiss' },
  { id: 'ecmwf_ifs025', label: 'ECMWF' },
  { id: 'icon_d2', label: 'ICON-D2' },
];

export const TopBar: React.FC<TopBarProps> = ({ onOpenSearch }) => {
  const {
    selectedLocation,
    favorites,
    selectedModel,
    setSelectedLocation,
    setSelectedModel,
    toggleFavorite,
    isFavorite,
  } = useAppStore();

  const { getCurrentLocation, isLoading: isGpsLoading } = useGeolocation();
  const isFav = isFavorite(selectedLocation.id);

  return (
    <header className="sticky top-0 z-40 bg-slate-950/85 backdrop-blur-md border-b border-slate-800/80 px-4 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2.5">
      {/* Upper line: App title, active model selector and quick tools */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
            <CloudRain className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">
              Al piöf
            </h1>
            <span className="text-[10px] text-sky-400/80 font-medium">
              Previsioni Multi-Modello
            </span>
          </div>
        </div>

        {/* Model dropdown selector */}
        <div className="flex items-center gap-1.5">
          <select
            value={selectedModel}
            onChange={(e) => setSelectedModel(e.target.value as WeatherModel)}
            className="text-xs bg-slate-900 border border-slate-800 text-sky-300 rounded-lg px-2 py-1 outline-none focus:border-sky-500 cursor-pointer"
          >
            {MODELS.map((m) => (
              <option key={m.id} value={m.id} className="bg-slate-900 text-slate-200">
                {m.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Location row with GPS, Star and Search trigger */}
      <div className="flex items-center justify-between gap-2 bg-slate-900/70 border border-slate-800/90 rounded-xl px-3 py-2 mb-2.5">
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2 text-left min-w-0 flex-1 group"
        >
          <MapPin className="w-4 h-4 text-sky-400 shrink-0 group-hover:scale-110 transition-transform" />
          <div className="min-w-0 truncate">
            <div className="text-sm font-semibold text-slate-100 truncate group-hover:text-sky-300 transition-colors">
              {selectedLocation.name}
            </div>
            <div className="text-[10px] text-slate-400 truncate">
              {selectedLocation.elevation ? `${selectedLocation.elevation} m s.l.m.` : ''}
              {selectedLocation.population ? ` • ${selectedLocation.population.toLocaleString('it-IT')} ab.` : ''}
              {selectedLocation.admin2 ? ` • Prov. ${selectedLocation.admin2}` : selectedLocation.admin1 ? ` • ${selectedLocation.admin1}` : ''}
            </div>
          </div>
        </button>

        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => toggleFavorite(selectedLocation)}
            title={isFav ? 'Rimuovi dai preferiti' : 'Aggiungi ai preferiti'}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 transition-colors"
          >
            <Star
              className={`w-4 h-4 ${
                isFav ? 'text-amber-400 fill-amber-400' : 'hover:text-amber-300'
              }`}
            />
          </button>

          <button
            onClick={() => getCurrentLocation()}
            disabled={isGpsLoading}
            title="Usa posizione GPS"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-sky-400 transition-colors disabled:opacity-50"
          >
            {isGpsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-sky-400" />
            ) : (
              <Navigation className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={onOpenSearch}
            title="Cerca località"
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-sky-400 transition-colors"
          >
            <Search className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Horizontal scrolling favorites pills */}
      {favorites.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1.5">
          {favorites.map((fav: Location) => {
            const active = fav.id === selectedLocation.id;
            return (
              <button
                key={fav.id}
                onClick={() => setSelectedLocation(fav)}
                className={`shrink-0 text-xs px-2.5 py-1 rounded-full border transition-all ${
                  active
                    ? 'bg-sky-500/20 border-sky-500/60 text-sky-200 font-medium shadow-sm shadow-sky-950'
                    : 'bg-slate-900/60 border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                {fav.name}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
