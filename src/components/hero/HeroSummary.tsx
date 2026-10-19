import React from 'react';
import {
  Wind,
  Droplets,
  Sun,
  Sunrise,
  Sunset,
  Mountain,
  Gauge,
  Sparkles,
  ArrowUp,
} from 'lucide-react';
import { getWmoInfo } from '../../utils/wmoCodes';
import { getWindDirection, getWindArrowStyle } from '../../utils/windUtils';
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
  const isToday = selectedDayIndex === 0;
  const currentDay = data.daily[selectedDayIndex] || data.daily[0];

  const wmoCode = isToday ? data.current.weatherCode : currentDay.weatherCode;
  const wmo = getWmoInfo(wmoCode, isToday ? data.current.isDay : true);
  const WmoIcon = wmo.icon;

  const windDir = isToday
    ? getWindDirection(data.current.windDirection)
    : 'N/D';
  const windAngle = isToday ? data.current.windDirection : 0;

  return (
    <div className="px-4 py-3 space-y-3">
      {/* Main Hero Card */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900/90 to-slate-900/60 border border-slate-800/90 rounded-3xl p-5 shadow-2xl backdrop-blur-md">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-sky-400 font-medium mb-1">
              <span>{isToday ? 'Adesso • In tempo reale' : currentDay.dayName}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-extrabold text-white tracking-tighter">
                {isToday ? `${data.current.temperature}°` : `${currentDay.tempMax}°`}
              </span>
              <div className="text-xs text-slate-400">
                {isToday ? (
                  <>
                    <div>Percepita {data.current.apparentTemperature}°</div>
                    <div className="text-slate-300 font-medium">
                      Max {currentDay.tempMax}° • Min {currentDay.tempMin}°
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-slate-300 font-medium">Minima: {currentDay.tempMin}°</div>
                    <div>Pioggia: {currentDay.precipitationSum} mm</div>
                  </>
                )}
              </div>
            </div>
            <div className="mt-2 text-sm font-semibold text-slate-200">
              {wmo.label}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/80">
            <WmoIcon className={`w-14 h-14 ${wmo.colorClass}`} />
          </div>
        </div>
      </div>

      {/* Bento Grid (2x3) */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* 1. Qualità dell'Aria */}
        <button
          onClick={onOpenAirQuality}
          className="p-3 bg-slate-900/70 border border-slate-800/90 rounded-2xl text-left hover:border-slate-700 transition-colors group"
        >
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Qualità Aria</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          {data.airQuality ? (
            <div>
              <div className="text-base font-bold text-white">
                EAQI {data.airQuality.europeanAqi}
              </div>
              <div className="text-[11px] flex items-center justify-between mt-0.5">
                <span className={`font-semibold ${data.airQuality.colorClass}`}>
                  {data.airQuality.label}
                </span>
                <span className="text-sky-400 group-hover:underline text-[10px]">
                  Pollini &rarr;
                </span>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-500">Non disponibile</div>
          )}
        </button>

        {/* 2. Zero Termico & Pressione */}
        <div className="p-3 bg-slate-900/70 border border-slate-800/90 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Zero Termico</span>
            <Mountain className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-base font-bold text-white">
            {data.current.freezingLevel} <span className="text-xs font-normal text-slate-400">m</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
            <Gauge className="w-3 h-3 text-slate-500" />
            <span>{data.current.surfacePressure} hPa</span>
          </div>
        </div>

        {/* 3. Vento & Raffiche */}
        <div className="p-3 bg-slate-900/70 border border-slate-800/90 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Vento</span>
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-center gap-1.5 text-base font-bold text-white">
            <span style={getWindArrowStyle(windAngle)} className="inline-block">
              <ArrowUp className="w-4 h-4 text-cyan-400" />
            </span>
            <span>
              {isToday ? `${data.current.windSpeed} km/h` : `${currentDay.windSpeedMax} km/h`}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {isToday ? `${windDir} • Raffica ${data.current.windGusts} km/h` : `Raffica max ${currentDay.windGustsMax} km/h`}
          </div>
        </div>

        {/* 4. Umidità Relativa */}
        <div className="p-3 bg-slate-900/70 border border-slate-800/90 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Umidità</span>
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-base font-bold text-white">
            {data.current.relativeHumidity}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-blue-400 h-full rounded-full"
              style={{ width: `${data.current.relativeHumidity}%` }}
            />
          </div>
        </div>

        {/* 5. Indice UV */}
        <div className="p-3 bg-slate-900/70 border border-slate-800/90 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Indice UV Max</span>
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-base font-bold text-white">
            {currentDay.uvIndexMax}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            {currentDay.uvIndexMax <= 2 ? 'Basso' : currentDay.uvIndexMax <= 5 ? 'Moderato' : 'Forte'}
          </div>
        </div>

        {/* 6. Alba & Tramonto */}
        <div className="p-3 bg-slate-900/70 border border-slate-800/90 rounded-2xl">
          <div className="text-[11px] font-medium text-slate-400 mb-1">
            Alba &amp; Tramonto
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-100 mt-1">
            <div className="flex items-center gap-1">
              <Sunrise className="w-3.5 h-3.5 text-amber-300" />
              <span>{currentDay.sunrise}</span>
            </div>
            <div className="flex items-center gap-1">
              <Sunset className="w-3.5 h-3.5 text-orange-400" />
              <span>{currentDay.sunset}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
