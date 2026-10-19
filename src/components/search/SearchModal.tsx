import React, { useState, useEffect, useRef } from 'react';
import { Search, X, MapPin, Star, Navigation, Loader2 } from 'lucide-react';
import { searchLocations } from '../../api/geocodingApi';
import { useAppStore } from '../../store/useAppStore';
import { useGeolocation } from '../../hooks/useGeolocation';
import type { Location } from '../../types/weather.types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const { setSelectedLocation, favorites, toggleFavorite } = useAppStore();
  const { getCurrentLocation, isLoading: isGpsLoading } = useGeolocation();
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Debounced search (300ms)
  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);

    const timer = setTimeout(async () => {
      try {
        const data = await searchLocations(trimmed);
        setResults(data);
      } catch (err: unknown) {
        setSearchError('Errore durante la ricerca. Riprova.');
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (loc: Location) => {
    setSelectedLocation(loc);
    onClose();
  };

  const handleGps = async () => {
    const loc = await getCurrentLocation();
    if (loc) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden mt-6 flex flex-col max-h-[85vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-2 p-3 border-b border-slate-800 bg-slate-900/90">
          <Search className="w-4 h-4 text-slate-400 shrink-0 ml-1" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cerca comune, via o quartiere (es. Milano Bicocca, Bergamo)..."
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-200"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs text-sky-400 hover:text-sky-300 font-medium px-2 py-1"
          >
            Chiudi
          </button>
        </div>

        {/* GPS Current Location Option */}
        <div className="p-2 border-b border-slate-800/60 bg-slate-900/50">
          <button
            onClick={handleGps}
            disabled={isGpsLoading}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left hover:bg-slate-800/80 text-sky-300 transition-colors disabled:opacity-50"
          >
            {isGpsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin shrink-0 text-sky-400" />
            ) : (
              <Navigation className="w-4 h-4 shrink-0 text-sky-400" />
            )}
            <div className="text-xs font-semibold">
              Usa la mia posizione attuale (GPS)
            </div>
          </button>
        </div>

        {/* Results / Favorites list */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-800/40 p-2">
          {isSearching && (
            <div className="py-8 flex flex-col items-center justify-center gap-2 text-slate-400">
              <Loader2 className="w-5 h-5 animate-spin text-sky-400" />
              <span className="text-xs">Ricerca località in corso...</span>
            </div>
          )}

          {searchError && (
            <div className="p-3 text-center text-xs text-red-400">
              {searchError}
            </div>
          )}

          {!isSearching && query.trim().length >= 2 && results.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              Nessuna località trovata per &ldquo;{query}&rdquo;
            </div>
          )}

          {/* Search Results */}
          {results.map((loc) => {
            const isFav = favorites.some((f) => f.id === loc.id);
            return (
              <div
                key={loc.id}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/60 transition-colors group"
              >
                <button
                  onClick={() => handleSelect(loc)}
                  className="flex items-center gap-3 text-left flex-1 min-w-0"
                >
                  <MapPin className="w-4 h-4 text-sky-400 shrink-0 group-hover:scale-110 transition-transform" />
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-slate-100 truncate">
                      {loc.name}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate">
                      {loc.elevation ? `${loc.elevation} m s.l.m.` : ''}
                      {loc.population ? ` • ${loc.population.toLocaleString('it-IT')} ab.` : ''}
                      {loc.admin2 ? ` • Prov. ${loc.admin2}` : loc.admin1 ? ` • ${loc.admin1}` : ''}
                    </div>
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(loc);
                  }}
                  className="p-2 text-slate-400 hover:text-amber-400"
                >
                  <Star
                    className={`w-4 h-4 ${
                      isFav ? 'text-amber-400 fill-amber-400' : ''
                    }`}
                  />
                </button>
              </div>
            );
          })}

          {/* Quick suggestions from favorites when query is empty */}
          {!query && favorites.length > 0 && (
            <div className="pt-2">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 pb-1">
                Località salvate
              </div>
              {favorites.map((fav) => (
                <div
                  key={fav.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-800/60 transition-colors"
                >
                  <button
                    onClick={() => handleSelect(fav)}
                    className="flex items-center gap-3 text-left flex-1 min-w-0"
                  >
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-200 truncate">
                        {fav.name}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        {fav.admin1 || fav.country || ''}
                        {fav.elevation ? ` • ${fav.elevation} m` : ''}
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
