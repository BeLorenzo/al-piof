import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  Location,
  WeatherModel,
  ViewMode,
  UserPreferences,
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

export const DEFAULT_FAVORITES: Location[] = [];

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'dynamic',
  customBgColor: '#fce7f3',
  accentColor: 'sky',
  customAccentColor: '#f43f5e',
  font: 'technical',
  surfaceStyle: 'glass',
  useEnsembleAverageInBlend: true,
  roundTemperatures: false,
  windUnit: 'kmh',
  defaultFilterFromNow: false,
  compactHourlyRows: false,
  showTextSummary: true,
  showModelComparison: true,
  showHistoricalAlmanac: true,
  showBottomRadarPreview: true,
  visibleBentoCards: [
    'visibility',
    'airQuality',
    'pressureDew',
    'wind',
    'humidity',
    'uv',
    'sunMoon',
    'cloudSun',
  ],
  widgetConfig: {
    theme: 'slate_dark',
    showRain: true,
    showWind: true,
    showAqi: true,
    showUv: true,
  },
};

const VALID_MODELS: WeatherModel[] = [
  'best_match',
  'meteoswiss_icon_ch2',
  'ecmwf_ifs025',
  'icon_d2',
];

interface AppState {
  selectedLocation: Location;
  favorites: Location[];
  selectedModel: WeatherModel;
  selectedDayIndex: number;
  viewMode: ViewMode;
  preferences: UserPreferences;
  isSettingsOpen: boolean;

  // Actions
  setSelectedLocation: (loc: Location) => void;
  setSelectedModel: (model: WeatherModel) => void;
  setSelectedDayIndex: (index: number) => void;
  setViewMode: (mode: ViewMode) => void;
  toggleFavorite: (loc: Location) => void;
  isFavorite: (locId: string) => boolean;
  updatePreferences: (partial: Partial<UserPreferences>) => void;
  resetPreferences: () => void;
  setIsSettingsOpen: (isOpen: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      selectedLocation: DEFAULT_FALLBACK_LOCATION,
      favorites: DEFAULT_FAVORITES,
      selectedModel: 'best_match',
      selectedDayIndex: 0,
      viewMode: 'hourly',
      preferences: DEFAULT_PREFERENCES,
      isSettingsOpen: false,

      setSelectedLocation: (loc) => set({ selectedLocation: loc, selectedDayIndex: 0 }),
      setSelectedModel: (model) => {
        const safeModel = VALID_MODELS.includes(model) ? model : 'best_match';
        set({ selectedModel: safeModel });
      },
      setSelectedDayIndex: (index) => set({ selectedDayIndex: index }),
      setViewMode: (mode) => set({ viewMode: mode }),
      setIsSettingsOpen: (isOpen) => set({ isSettingsOpen: isOpen }),

      updatePreferences: (partial) => {
        set((state) => ({
          preferences: { ...state.preferences, ...partial },
        }));
      },

      resetPreferences: () => {
        set({ preferences: DEFAULT_PREFERENCES });
      },

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
      // Migrazione automatica: ripulisce 'ensemble' e assicura tutte le chiavi preferences
      merge: (persistedState: unknown, currentState: AppState) => {
        if (!persistedState || typeof persistedState !== 'object') {
          return currentState;
        }

        const stateObj = persistedState as Partial<AppState>;
        const safeModel =
          stateObj.selectedModel && VALID_MODELS.includes(stateObj.selectedModel)
            ? stateObj.selectedModel
            : 'best_match';

        const mergedPrefs: UserPreferences = {
          ...DEFAULT_PREFERENCES,
          ...(stateObj.preferences || {}),
        };

        return {
          ...currentState,
          ...stateObj,
          selectedModel: safeModel,
          preferences: mergedPrefs,
        };
      },
      partialize: (state) => ({
        selectedLocation: state.selectedLocation,
        favorites: state.favorites,
        selectedModel: state.selectedModel,
        viewMode: state.viewMode,
        preferences: state.preferences,
      }),
    }
  )
);
