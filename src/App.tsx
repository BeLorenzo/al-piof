import { useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { useWeatherData } from './hooks/useWeatherData';
import { TopBar } from './components/layout/TopBar';
import { RefreshStatusBar } from './components/layout/RefreshStatusBar';
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
import { Loader2, AlertTriangle, ListFilter, LineChart, Radar } from 'lucide-react';

export default function App() {
  const { selectedLocation, selectedModel, selectedDayIndex, viewMode, setViewMode } = useAppStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAirQualityOpen, setIsAirQualityOpen] = useState(false);

  const { data, isLoading, isFetching, isError, error, refetch } = useWeatherData(
    selectedLocation,
    selectedModel
  );

  const currentDay = data?.daily[selectedDayIndex] || data?.daily[0];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900/40 via-slate-950 to-slate-950 text-slate-100 flex justify-center selection:bg-sky-500/30 selection:text-sky-200">
      <div className="w-full max-w-lg bg-transparent flex flex-col min-h-screen relative">
        {/* Navigation & Controls */}
        <TopBar onOpenSearch={() => setIsSearchOpen(true)} />

        {/* Refresh & Offline Status Bar */}
        <RefreshStatusBar
          updatedAt={data?.updatedAt}
          isFetching={isFetching}
          onRefresh={() => refetch()}
        />

        {/* Search Modal */}
        <SearchModal
          isOpen={isSearchOpen}
          onClose={() => setIsSearchOpen(false)}
        />

        {/* Air Quality & Pollen Modal */}
        <AirQualityModal
          isOpen={isAirQualityOpen}
          onClose={() => setIsAirQualityOpen(false)}
          airQuality={data?.airQuality || null}
        />

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
            {/* 15-min Nowcasting Alert (if rain expected in next 2h) */}
            <MinutelyCastAlert slots={data.minutely15} />

            {/* Hero Summary & Bento Grid */}
            <HeroSummary
              data={data}
              selectedDayIndex={selectedDayIndex}
              onOpenAirQuality={() => setIsAirQualityOpen(true)}
            />

            {/* 7-Days Carousel */}
            <DaySelector days={data.daily} />

            {/* View Mode Switching: Hourly List vs Chart vs Radar */}
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
              <HourlyChart hourly={currentDay.hourly} />
            )}

            {viewMode === 'radar' && (
              <div className="py-2 animate-fade-in">
                <RadarSection
                  location={selectedLocation}
                  isPreview={false}
                />
              </div>
            )}

            {/* Historical Almanac (past 5 years) */}
            <HistoricalComparisonCard
              latitude={selectedLocation.latitude}
              longitude={selectedLocation.longitude}
              selectedDate={currentDay.date}
              currentTempMax={currentDay.tempMax}
            />

            {/* Radar Preview at the bottom of the Home view (with anti scroll-trap) */}
            {viewMode !== 'radar' && (
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

        {/* Floating Native Bottom Navigation Dock */}
        <nav
          className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 px-2 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 shadow-2xl flex items-center gap-1.5"
          style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
        >
          <button
            onClick={() => {
              setViewMode('hourly');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              viewMode === 'hourly'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            type="button"
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>Oraria</span>
          </button>

          <button
            onClick={() => {
              setViewMode('chart');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              viewMode === 'chart'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            type="button"
          >
            <LineChart className="w-3.5 h-3.5" />
            <span>Grafico</span>
          </button>

          <button
            onClick={() => {
              setViewMode('radar');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
              viewMode === 'radar'
                ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30 font-bold scale-105'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            type="button"
          >
            <Radar className="w-3.5 h-3.5" />
            <span>Mappa</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
