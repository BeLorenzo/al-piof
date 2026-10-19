import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Location,
  WeatherModel,
  ViewMode,
} from '../types/weather.types';

export const DEFAULT_FALLBACK_LOCATION: Location = {
  id: '45.7058_9.4975_Sotto il Monte Giovanni XXIII',
  name: 'Sotto il Monte Giovanni XXIII',
  admin1: 'Lombardia',
  country: 'Italia',
  latitude: 45.7058,
  longitude: 9.4975,
  elevation: 291,
};

export const DEFAULT_FAVORITES: Location[] = [
  DEFAULT_FALLBACK_LOCATION,
  {
    id: '45.4642_9.1900_Milano',
    name: 'Milano',
    admin1: 'Lombardia',
    country: 'Italia',
    latitude: 45.4642,
    longitude: 9.19,
    elevation: 120,
  },
  {
    id: '46.0037_8.9511_Lugano',
    name: 'Lugano',
    admin1: 'Ticino',
    country: 'Svizzera',
    latitude: 46.0037,
    longitude: 8.9511,
    elevation: 273,
  },
  {
    id: '45.6983_9.6773_Bergamo',
    name: 'Bergamo',
    admin1: 'Lombardia',
    country: 'Italia',
    latitude: 45.6983,
    longitude: 9.6773,
    elevation: 249,
  },
];

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
          // Never allow empty favorites, fallback to Sotto il Monte
          const next = favorites.filter((f) => f.id !== loc.id);
          set({
            favorites: next.length > 0 ? next : [DEFAULT_FALLBACK_LOCATION],
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
