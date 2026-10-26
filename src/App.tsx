import { useLayoutEffect, useState, useEffect, useRef } from 'react';
import { useAppStore } from './store/useAppStore';
import { useWeatherData } from './hooks/useWeatherData';
import { useGeolocation } from './hooks/useGeolocation';
import { TopBar } from './components/layout/TopBar';
import { RefreshStatusBar } from './components/layout/RefreshStatusBar';
import { UpdateNotificationBanner } from './components/layout/UpdateNotificationBanner';
import { SearchModal } from './components/search/SearchModal';
import { DaySelector } from './components/forecast/DaySelector';
import { HeroSummary } from './components/hero/HeroSummary';
import { MinutelyCastAlert } from './components/hero/MinutelyCastAlert';
import { AirQualityModal } from './components/hero/AirQualityModal';
import { HourScrubber } from './components/forecast/HourScrubber';
import { HourlyVerticalList } from './components/forecast/HourlyVerticalList';
import { HourlyChart } from './components/forecast/HourlyChart';
import { RadarSection } from './components/radar/RadarSection';
import { HistoricalComparisonCard } from './components/forecast/HistoricalComparisonCard';
import { SettingsDrawer } from './components/settings/SettingsDrawer';
import { BottomNavDock } from './components/layout/BottomNavDock';
import { applyThemeToDocument } from './utils/themeUtils';
import { syncWidgetWithData } from './utils/widgetBridge';
import { Loader2, AlertTriangle } from 'lucide-react';

export default function App() {
  const {
    selectedLocation,
    selectedModel,
    selectedDayIndex,
    viewMode,
    setViewMode,
    preferences,
  } = useAppStore();

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAirQualityOpen, setIsAirQualityOpen] = useState(false);

  const { getCurrentLocation } = useGeolocation();
  const lastForegroundRefresh = useRef<number>(0);

  const { data, isLoading, isFetching, isError, error, refetch } = useWeatherData(
    selectedLocation,
    selectedModel
  );

  // Auto-refresh posizione GPS e dati all'apertura e al ritorno in foreground
  useEffect(() => {
    const handleForegroundSync = async () => {
      const now = Date.now();
      if (now - lastForegroundRefresh.current < 60000) {
        return;
      }
      lastForegroundRefresh.current = now;

      const currentLoc = useAppStore.getState().selectedLocation;
      if (currentLoc.isCurrentLocation) {
        await getCurrentLocation({ silent: true });
        const afterLoc = useAppStore.getState().selectedLocation;
        const locChanged =
          afterLoc.latitude !== currentLoc.latitude ||
          afterLoc.longitude !== currentLoc.longitude;
        if (!locChanged) {
          refetch();
        }
      } else {
        refetch();
      }
    };

    handleForegroundSync();

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        handleForegroundSync();
      }
    };
    const onFocus = () => {
      handleForegroundSync();
    };

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', onFocus);

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', onFocus);
    };
  }, [getCurrentLocation, refetch]);

  const currentDay = data?.daily[selectedDayIndex] || data?.daily[0];

  // Il tema vive su <html>: cosi' body, overscroll e modali ereditano la stessa palette
  const dynamicCode = data?.current.weatherCode;
  const dynamicIsDay = data?.current.isDay;
  useLayoutEffect(() => {
    applyThemeToDocument(preferences, data);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preferences, dynamicCode, dynamicIsDay]);

  // Sincronizza il widget Android della schermata Home in tempo reale
  useEffect(() => {
    if (data) {
      syncWidgetWithData(data, preferences.widgetConfig);
    }
  }, [data, preferences.widgetConfig]);

  return (
    <div
      className={`min-h-screen app-theme-root font-${preferences.font} surface-${preferences.surfaceStyle} flex justify-center transition-colors duration-300`}
    >
      <div className="w-full max-w-lg bg-transparent flex flex-col min-h-screen relative">
        {/* Navigation & Controls */}
        <TopBar onOpenSearch={() => setIsSearchOpen(true)} />

        {/* Refresh & Offline Status Bar */}
        <RefreshStatusBar
          updatedAt={data?.updatedAt}
          isFetching={isFetching}
          onRefresh={() => {
            refetch();
            window.dispatchEvent(new CustomEvent('alpiof:check-update'));
          }}
        />

        {/* In-App Update Notification Banner */}
        <UpdateNotificationBanner />

        {/* Modals & Settings Drawer */}
        <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        <AirQualityModal
          isOpen={isAirQualityOpen}
          onClose={() => setIsAirQualityOpen(false)}
          airQuality={data?.airQuality || null}
        />
        <SettingsDrawer />

        {/* Loading state */}
        {isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center py-24 gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-sky-400" />
            <span className="text-xs font-medium">
              Calcolo modelli MeteoSwiss ({selectedModel})...
            </span>
          </div>
        )}

        {/* Error state */}
        {isError && (
          <div className="p-6 m-4 bg-red-950/40 border border-red-900/60 rounded-2xl text-center space-y-3">
            <AlertTriangle className="w-8 h-8 text-red-400 mx-auto" />
            <div className="text-sm font-semibold text-red-200">
              Impossibile caricare i dati meteo
            </div>
            <div className="text-xs text-red-300">
              {(error as Error)?.message || 'Errore di connessione a Open-Meteo'}
            </div>
            <button
              onClick={() => refetch()}
              className="px-4 py-2 bg-red-900/60 hover:bg-red-800 text-xs font-semibold text-white rounded-xl transition-colors"
            >
              Riprova
            </button>
          </div>
        )}

        {/* Main Content when data is ready */}
        {data && currentDay && (
          <main className="flex-1 pb-28">
            <MinutelyCastAlert slots={data.minutely15} />

            <HeroSummary
              data={data}
              selectedDayIndex={selectedDayIndex}
              onOpenAirQuality={() => setIsAirQualityOpen(true)}
            />

            <DaySelector days={data.daily} />

            {/* View Mode Switching */}
            {viewMode === 'hourly' && (
              <>
                <HourScrubber hourly={currentDay.hourly} />
                <HourlyVerticalList
                  hourly={currentDay.hourly}
                  isToday={selectedDayIndex === 0}
                />
              </>
            )}

            {viewMode === 'chart' && (
              <HourlyChart
                hourly={currentDay.hourly}
                isToday={selectedDayIndex === 0}
              />
            )}

            {viewMode === 'radar' && (
              <div className="py-2 animate-fade-in">
                <RadarSection location={selectedLocation} isPreview={false} />
              </div>
            )}

            {/* Historical Almanac */}
            {preferences.showHistoricalAlmanac && (
              <HistoricalComparisonCard
                latitude={selectedLocation.latitude}
                longitude={selectedLocation.longitude}
                selectedDate={currentDay.date}
                currentTempMax={currentDay.tempMax}
              />
            )}

            {/* Radar Preview */}
            {preferences.showBottomRadarPreview && viewMode !== 'radar' && (
              <div className="mt-4 border-t border-slate-900 pt-2">
                <RadarSection
                  location={selectedLocation}
                  isPreview={true}
                  onExpand={() => {
                    setViewMode('radar');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </main>
        )}

        {/* Bottom Floating Navigation Dock */}
        <BottomNavDock />
      </div>
    </div>
  );
}
