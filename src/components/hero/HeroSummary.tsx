import React, { useState } from 'react';
import {
  Wind,
  Droplets,
  Sun,
  Sunrise,
  Sunset,
  Gauge,
  Sparkles,
  ArrowUp,
  TrendingUp,
  TrendingDown,
  Minus,
  ShieldCheck,
  Info,
} from 'lucide-react';
import { getWmoInfo } from '../../utils/wmoCodes';
import { getWindDirection, getWindArrowStyle } from '../../utils/windUtils';
import { getUvInfo, getDewPointComfort } from '../../utils/meteoMath';
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
  const [showSpreadInfo, setShowSpreadInfo] = useState(false);
  const isToday = selectedDayIndex === 0;
  const currentDay = data.daily[selectedDayIndex] || data.daily[0];

  const wmoCode = isToday ? data.current.weatherCode : currentDay.weatherCode;
  const wmo = getWmoInfo(wmoCode, isToday ? data.current.isDay : true);
  const WmoIcon = wmo.icon;

  const windDir = isToday
    ? getWindDirection(data.current.windDirection)
    : getWindDirection(currentDay.hourly[12]?.windDirection ?? 0);
  const windAngle = isToday
    ? data.current.windDirection
    : currentDay.hourly[12]?.windDirection ?? 0;

  const reliability = isToday
    ? data.current.reliability
    : currentDay.reliability;

  const uvInfo = getUvInfo(currentDay.uvIndexMax);
  const dewPointVal = isToday ? data.current.dewPoint : currentDay.dewPointMax;
  const dewComfort = getDewPointComfort(dewPointVal);

  const pressureTrend = isToday ? data.current.pressureTrend : currentDay.pressureTrend;

  return (
    <div className="px-4 py-2 space-y-2.5">
      {/* Dynamic Smart Text Summary */}
      <div className="p-2.5 rounded-2xl bg-sky-950/40 border border-sky-800/50 text-xs text-sky-200 flex items-start gap-2 shadow-sm">
        <Sparkles className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
        <span className="leading-snug">{currentDay.summaryText}</span>
      </div>

      {/* Main Hero Card */}
      <div className="relative overflow-hidden bg-gradient-to-b from-slate-900/90 to-slate-900/60 border border-slate-800/90 rounded-3xl p-4 shadow-2xl backdrop-blur-md">
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
            <div className="mt-1.5 text-sm font-semibold text-slate-200">
              {wmo.label}
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-950/40 border border-slate-800/80">
            <WmoIcon className={`w-12 h-12 ${wmo.colorClass}`} />
          </div>
        </div>

        {/* Reliability Score Badge with toggleable spread info */}
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-sky-400" />
            <span className="text-slate-400">Affidabilità Modelli:</span>
            <span className={`font-bold ${reliability.colorClass}`}>
              {reliability.label} ({reliability.score}%)
            </span>
          </div>

          <button
            onClick={() => setShowSpreadInfo((p) => !p)}
            className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-medium"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Spread</span>
          </button>
        </div>

        {showSpreadInfo && (
          <div className="mt-2 p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-[11px] text-slate-300 space-y-1 animate-fade-in">
            <div className="flex justify-between">
              <span className="text-slate-400">Forchetta min-max modelli:</span>
              <span className="font-semibold text-white">
                {reliability.minTemp}°C &rarr; {reliability.maxTemp}°C (Δ {reliability.tempSpread}°C)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Concordanza pioggia:</span>
              <span className="font-semibold text-cyan-300">
                {Math.round(reliability.rainConcordance * 100)}%
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Bento Grid (2x3) */}
      <div className="grid grid-cols-2 gap-2">
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

        {/* 2. Pressione & Punto di Rugiada */}
        <div className="p-3 bg-slate-900/70 border border-slate-800/90 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Pressione &amp; Rugiada</span>
            <Gauge className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="flex items-center gap-1.5 text-base font-bold text-white">
            <span>{isToday ? data.current.surfacePressure : currentDay.pressureAvg} hPa</span>
            {pressureTrend === 'rising' ? (
              <span title="In aumento">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              </span>
            ) : pressureTrend === 'falling' ? (
              <span title="In calo">
                <TrendingDown className="w-3.5 h-3.5 text-rose-400" />
              </span>
            ) : (
              <span title="Stabile">
                <Minus className="w-3.5 h-3.5 text-slate-400" />
              </span>
            )}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate">
            Rugiada {dewPointVal}° • <span className={`font-medium ${dewComfort.colorClass}`}>{dewComfort.label}</span>
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
          <div className="text-[11px] text-slate-400 mt-0.5 truncate">
            {isToday ? `${windDir} • Raffica ${data.current.windGusts} km/h` : `Raffica ${currentDay.windGustsMax} km/h`}
          </div>
        </div>

        {/* 4. Umidità Relativa */}
        <div className="p-3 bg-slate-900/70 border border-slate-800/90 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Umidità</span>
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-base font-bold text-white">
            {isToday ? `${data.current.relativeHumidity}%` : `${currentDay.hourly[12]?.relativeHumidity ?? 60}%`}
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className="bg-blue-400 h-full rounded-full"
              style={{
                width: `${isToday ? data.current.relativeHumidity : currentDay.hourly[12]?.relativeHumidity ?? 60}%`,
              }}
            />
          </div>
        </div>

        {/* 5. Indice UV su scala /11 OMS */}
        <div className="p-3 bg-slate-900/70 border border-slate-800/90 rounded-2xl">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Indice UV Max</span>
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-base font-bold text-white">
            {uvInfo.ratioText}
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div
              className={`h-full rounded-full ${uvInfo.bgClass}`}
              style={{ width: `${uvInfo.progressPct}%` }}
            />
          </div>
          <div className={`text-[10px] font-semibold mt-1 ${uvInfo.colorClass}`}>
            {uvInfo.label}
          </div>
        </div>

        {/* 6. Sole & Luna */}
        <div className="p-3 bg-slate-900/70 border border-slate-800/90 rounded-2xl">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="font-medium">Sole &amp; Luna</span>
            <span className="text-xs" title={currentDay.moon.phaseName}>
              {currentDay.moon.phaseIcon}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-100">
            <div className="flex items-center gap-1">
              <Sunrise className="w-3.5 h-3.5 text-amber-300" />
              <span>{currentDay.sunrise}</span>
            </div>
            <div className="flex items-center gap-1">
              <Sunset className="w-3.5 h-3.5 text-orange-400" />
              <span>{currentDay.sunset}</span>
            </div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
            <span>{currentDay.moon.phaseName}</span>
            <span className="text-slate-300 font-medium">
              {currentDay.moon.illuminationPct}% luce
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
