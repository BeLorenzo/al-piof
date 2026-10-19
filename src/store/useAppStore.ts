import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Location,
  WeatherModel,
  ViewMode,
} from '../types/weather.types';

export const DEFAULT_FALLBACK_LOCATION: Location = {
  id: '45.4642_9.1900_Milano',
  name: 'Milano',
  admin1: 'Lombardia',
  admin2: 'Milano',
  country: 'Italia',
  latitude: 45.4642,
  longitude: 9.19,
  elevation: 120,
  population: 1395274,
};

// Nessun dato personale cablato nel repo: i preferiti partono vuoti e si salvano nel localStorage
export const DEFAULT_FAVORITES: Location[] = [];

interface AppState {
  selectedLocation: Location;
  favorites: Location[];
  selectedModel: WeatherModel;
  selectedDayIndex: number;
  viewMode: ViewMode;

  // Actions
  setSelectedLocation: (loc: Location) => void;
  setSelectedModel: (model: WeatherModel) => void;
  setSelectedDayIndex: (index: number) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleFavorite: (loc: Location) => void;
  isFavorite: (locId: string) => boolean;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      selectedLocation: DEFAULT_FALLBACK_LOCATION,
      favorites: DEFAULT_FAVORITES,
      selectedModel: 'best_match',
      selectedDayIndex: 0,
      viewMode: 'hourly',

      setSelectedLocation: (loc) => set({ selectedLocation: loc, selectedDayIndex: 0 }),
      setSelectedModel: (model) => set({ selectedModel: model }),
      setSelectedDayIndex: (index) => set({ selectedDayIndex: index }),
      setViewMode: (mode) => set({ viewMode: mode }),

      toggleFavorite: (loc) => {
        const { favorites } = get();
        const exists = favorites.some((f) => f.id === loc.id);
        if (exists) {
          set({
            favorites: favorites.filter((f) => f.id !== loc.id),
          });
        } else {
          set({ favorites: [...favorites, loc] });
        }
      },

      isFavorite: (locId) => {
        return get().favorites.some((f) => f.id === locId);
      },
    }),
    {
      name: 'al-piof-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        selectedLocation: state.selectedLocation,
        favorites: state.favorites,
        selectedModel: state.selectedModel,
        viewMode: state.viewMode,
      }),
    }
  )
);
