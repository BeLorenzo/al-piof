import React from 'react';
import { Compass, Scale } from 'lucide-react';
import { getWmoInfo } from '../../utils/wmoCodes';
import { formatTemperature } from '../../utils/meteoMath';
import { ModelComparisonCard } from '../forecast/ModelComparisonCard';
import { HeroBentoGrid } from './HeroBentoGrid';
import { useAppStore } from '../../store/useAppStore';
import type { NormalizedWeatherData } from '../../types/weather.types';

interface HeroSummaryProps {
  data: NormalizedWeatherData;
  selectedDayIndex: number;
  onOpenAirQuality: () => void;
}

export const HeroSummary: React.FC<HeroSummaryProps> = ({
  data,
  selectedDayIndex,
  onOpenAirQuality,
}) => {
  const preferences = useAppStore((state) => state.preferences);
  const isToday = selectedDayIndex === 0;
  const currentDay = data.daily[selectedDayIndex] || data.daily[0];

  const wmoCode = isToday ? data.current.weatherCode : currentDay.weatherCode;
  const wmo = getWmoInfo(wmoCode, isToday ? data.current.isDay : true);
  const WmoIcon = wmo.icon;

  const scrollToModelComparison = () => {
    const el = document.getElementById('model-comparison-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="px-4 py-2 space-y-2.5">
      {/* Editorial Text Summary */}
      {preferences.showTextSummary && currentDay.summaryText && (
        <div className="p-3 rounded-2xl bg-slate-900/80 border-l-4 border-l-sky-500 border border-slate-800/80 text-xs text-slate-200 flex items-start gap-2.5 shadow-sm card-surface">
          <Compass className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
          <span className="leading-snug font-medium">{currentDay.summaryText}</span>
        </div>
      )}

      {/* Main Hero Card */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900/90 to-slate-900/60 border border-slate-800/90 rounded-3xl p-4 shadow-2xl backdrop-blur-md card-surface">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-sky-400 font-semibold mb-1">
              <span>{isToday ? 'Adesso • In tempo reale' : currentDay.dayName}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-black text-slate-100 tracking-tighter num-tabular">
                {isToday
                  ? formatTemperature(data.current.temperature, preferences.roundTemperatures)
                  : formatTemperature(currentDay.tempMax, preferences.roundTemperatures)}
              </span>
              <div className="text-xs text-slate-400 num-tabular">
                {isToday ? (
                  <>
                    <div>
                      Percepita {formatTemperature(data.current.apparentTemperature, preferences.roundTemperatures)}
                    </div>
                    <div className="text-slate-300 font-medium">
                      Max {formatTemperature(currentDay.tempMax, preferences.roundTemperatures)} • Min{' '}
                      {formatTemperature(currentDay.tempMin, preferences.roundTemperatures)}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-slate-300 font-medium">
                      Minima: {formatTemperature(currentDay.tempMin, preferences.roundTemperatures)}
                    </div>
                    <div>Pioggia: {currentDay.precipitationSum} mm</div>
                  </>
                )}
              </div>
            </div>
            <div className="mt-1.5 text-sm font-semibold text-slate-200">
              {wmo.label}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800/80 shadow-inner">
            <WmoIcon className={`w-12 h-12 ${wmo.colorClass}`} />
          </div>
        </div>

        {/* Compact In-Hero Reliability Badge */}
        {currentDay.comparison && (
          <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <button
              onClick={scrollToModelComparison}
              className="flex items-center gap-1.5 text-left group"
              type="button"
            >
              <Scale className="w-3.5 h-3.5 text-sky-400 shrink-0" />
              <span className="text-slate-400 group-hover:text-slate-200 transition-colors">
                Affidabilità Modelli:
              </span>
              <span
                className={`font-bold flex items-center gap-1 px-1.5 py-0.2 rounded text-[11px] ${
                  currentDay.comparison.overallReliability === 'Alta'
                    ? 'text-emerald-400 bg-emerald-950/60 border border-emerald-800/60'
                    : currentDay.comparison.overallReliability === 'Media'
                    ? 'text-yellow-400 bg-yellow-950/60 border border-yellow-800/60'
                    : 'text-orange-400 bg-orange-950/60 border border-orange-800/60'
                }`}
              >
                {currentDay.comparison.overallReliability} ({currentDay.comparison.overallScore}%)
              </span>
            </button>

            <span className="text-[11px] text-slate-400 num-tabular">
              Spread &Delta; {currentDay.comparison.tempMax.spread}&deg;C
            </span>
          </div>
        )}
      </div>

      {/* Multi-Model Comparison Card */}
      {preferences.showModelComparison && (
        <div id="model-comparison-section">
          <ModelComparisonCard
            comparison={currentDay.comparison}
            dayName={isToday ? 'Oggi' : currentDay.dayName}
          />
        </div>
      )}

      {/* Bento Grid */}
      <HeroBentoGrid
        data={data}
        selectedDayIndex={selectedDayIndex}
        onOpenAirQuality={onOpenAirQuality}
      />
    </div>
  );
};
