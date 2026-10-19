import { useState } from 'react';
import { useAppStore } from './store/useAppStore';
import { useWeatherData } from './hooks/useWeatherData';
import { TopBar } from './components/layout/TopBar';
import { SearchModal } from './components/search/SearchModal';
import { DaySelector } from './components/forecast/DaySelector';
import { HeroSummary } from './components/hero/HeroSummary';
import { MinutelyCastAlert } from './components/hero/MinutelyCastAlert';
import { AirQualityModal } from './components/hero/AirQualityModal';
import { HourScrubber } from './components/forecast/HourScrubber';
import { HourlyVerticalList } from './components/forecast/HourlyVerticalList';
import { HourlyChart } from './components/forecast/HourlyChart';
import { Loader2, AlertTriangle, Radar } from 'lucide-react';

export default function App() {
  const { selectedLocation, selectedModel, selectedDayIndex, viewMode } = useAppStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAirQualityOpen, setIsAirQualityOpen] = useState(false);

  const { data, isLoading, isError, error, refetch } = useWeatherData(
    selectedLocation,
    selectedModel
  );

  const currentDay = data?.daily[selectedDayIndex] || data?.daily[0];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex justify-center selection:bg-sky-500/30 selection:text-sky-200">
      <div className="w-full max-w-md bg-slate-950 flex flex-col min-h-screen border-x border-slate-900 shadow-2xl relative">
        {/* Navigation & Controls */}
        <TopBar onOpenSearch={() => setIsSearchOpen(true)} />

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
          <main className="flex-1 pb-12">
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
              <div className="p-8 text-center space-y-3 bg-slate-900/40 border-y border-slate-800/80 my-4">
                <Radar className="w-10 h-10 text-sky-400 mx-auto animate-pulse" />
                <div className="text-sm font-bold text-white">
                  Radar Precipitazioni DPC &amp; Windy
                </div>
                <div className="text-xs text-slate-400 max-w-xs mx-auto">
                  La sezione radar dual-engine interattiva sarà collegata nello Step 6 (Fase 3).
                </div>
              </div>
            )}
          </main>
        )}
      </div>
    </div>
  );
}
