import React from 'react';
import {
  Wind,
  Droplets,
  Sun,
  Sunrise,
  Sunset,
  Gauge,
  ArrowUp,
  TrendingUp,
  TrendingDown,
  Minus,
  Mountain,
  Leaf,
  Eye,
  Cloud,
} from 'lucide-react';
import { getWindDirection, getWindArrowStyle } from '../../utils/windUtils';
import { getUvInfo, getDewPointComfort, formatWindSpeed } from '../../utils/meteoMath';
import { useAppStore } from '../../store/useAppStore';
import type { NormalizedWeatherData } from '../../types/weather.types';

interface HeroBentoGridProps {
  data: NormalizedWeatherData;
  selectedDayIndex: number;
  onOpenAirQuality: () => void;
}

export const HeroBentoGrid: React.FC<HeroBentoGridProps> = ({
  data,
  selectedDayIndex,
  onOpenAirQuality,
}) => {
  const preferences = useAppStore((state) => state.preferences);
  const isToday = selectedDayIndex === 0;
  const currentDay = data.daily[selectedDayIndex] || data.daily[0];

  const windAngle = isToday ? data.current.windDirection : currentDay.windDirectionDominant;
  const windDir = getWindDirection(windAngle);
  const windSpeedVal = isToday ? data.current.windSpeed : currentDay.windSpeedMax;
  const windGustsVal = isToday ? data.current.windGusts : currentDay.windGustsMax;

  const uvInfo = getUvInfo(currentDay.uvIndexMax);
  const dewPointVal = isToday ? data.current.dewPoint : currentDay.dewPointMax;
  const dewComfort = getDewPointComfort(dewPointVal);
  const pressureTrend = isToday ? data.current.pressureTrend : currentDay.pressureTrend;

  const displayEaqi = isToday ? data.airQuality?.europeanAqi ?? null : currentDay.airQualityEaqi;
  const displayEaqiLabel = isToday ? data.airQuality?.label ?? 'N/D' : currentDay.airQualityLabel ?? 'N/D';
  const displayEaqiColor = isToday ? data.airQuality?.colorClass ?? 'text-slate-400' : currentDay.airQualityColor ?? 'text-slate-400';

  const visVal = isToday ? data.current.visibility : currentDay.visibilityMin;
  const visLabel = visVal >= 10 ? 'Ottima' : visVal >= 4 ? 'Buona' : visVal >= 1 ? 'Foschia' : 'Nebbia fitta';

  const visibleCards = preferences.visibleBentoCards;

  return (
    <div className="grid grid-cols-2 gap-2 text-xs">
      {/* 1. Visibilità & Nebbia */}
      {visibleCards.includes('visibility') && (
        <div className="p-3 bg-slate-900/70 border border-slate-800/90 rounded-2xl card-surface">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Visibilità</span>
            <Eye className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-base font-bold text-slate-100 num-tabular">{visVal} <span className="text-xs font-normal text-slate-400">km</span></div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">{visLabel}</div>
        </div>
      )}

      {/* 2. Copertura Nubi */}
      {visibleCards.includes('cloudSun') && (
        <div className="p-3 bg-slate-900/70 border border-slate-800/90 rounded-2xl card-surface">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Copertura Nubi</span>
            <Cloud className="w-3.5 h-3.5 text-indigo-400" />
          </div>
          <div className="text-base font-bold text-slate-100 num-tabular">{isToday ? `${data.current.cloudCover}%` : `${currentDay.cloudCoverAvg}%`}</div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            {(isToday ? data.current.cloudCover : currentDay.cloudCoverAvg) < 20 ? 'Cielo terso' : (isToday ? data.current.cloudCover : currentDay.cloudCoverAvg) < 60 ? 'Parz. nuvoloso' : 'Cielo coperto'}
          </div>
        </div>
      )}

      {/* 3. Qualità dell'Aria */}
      {visibleCards.includes('airQuality') && (
        <button onClick={onOpenAirQuality} className="p-3 bg-slate-900/70 border border-slate-800/90 rounded-2xl text-left hover:border-slate-700 transition-colors group card-surface" type="button">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Qualità Aria</span>
            <Leaf className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          {displayEaqi !== null ? (
            <div>
              <div className="text-base font-bold text-slate-100 num-tabular">EAQI {displayEaqi}</div>
              <div className="text-[11px] flex items-center justify-between mt-0.5">
                <span className={`font-semibold ${displayEaqiColor}`}>{displayEaqiLabel}</span>
                <span className="text-sky-400 group-hover:underline text-[10px]">Dettagli &rarr;</span>
              </div>
            </div>
          ) : <div className="text-xs text-slate-500">Non disponibile</div>}
        </button>
      )}

      {/* 4. Pressione & Punto di Rugiada */}
      {visibleCards.includes('pressureDew') && (
        <div className="p-3 bg-slate-900/70 border border-slate-800/90 rounded-2xl card-surface">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Pressione &amp; Rugiada</span>
            <Gauge className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="flex items-center gap-1.5 text-base font-bold text-slate-100 num-tabular">
            <span>{isToday ? data.current.surfacePressure : currentDay.pressureAvg} hPa</span>
            {pressureTrend === 'rising' ? <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : pressureTrend === 'falling' ? <TrendingDown className="w-3.5 h-3.5 text-rose-400" /> : <Minus className="w-3.5 h-3.5 text-slate-400" />}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate num-tabular">
            Rugiada {dewPointVal}&deg; &bull; <span className={`font-medium ${dewComfort.colorClass}`}>{dewComfort.label}</span>
          </div>
        </div>
      )}

      {/* 5. Vento & Raffiche */}
      {visibleCards.includes('wind') && (
        <div className="p-3 bg-slate-900/70 border border-slate-800/90 rounded-2xl card-surface">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Vento</span>
            <Wind className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="flex items-center gap-1.5 text-base font-bold text-slate-100 num-tabular">
            <span style={getWindArrowStyle(windAngle)} className="inline-block"><ArrowUp className="w-4 h-4 text-cyan-400" /></span>
            <span>{formatWindSpeed(windSpeedVal, preferences.windUnit)}</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5 truncate num-tabular">
            {windDir} &bull; Raffica {formatWindSpeed(windGustsVal, preferences.windUnit)}
          </div>
        </div>
      )}

      {/* 6. Umidità Relativa */}
      {visibleCards.includes('humidity') && (
        <div className="p-3 bg-slate-900/70 border border-slate-800/90 rounded-2xl card-surface">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Umidità Relativa</span>
            <Droplets className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-base font-bold text-slate-100 num-tabular">{isToday ? `${data.current.relativeHumidity}%` : `${currentDay.humidityAvg}%`}</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-blue-400 h-full rounded-full transition-all" style={{ width: `${isToday ? data.current.relativeHumidity : currentDay.humidityAvg}%` }} />
          </div>
        </div>
      )}

      {/* 7. Indice UV */}
      {visibleCards.includes('uv') && (
        <div className="p-3 bg-slate-900/70 border border-slate-800/90 rounded-2xl card-surface">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Indice UV Max</span>
            <Sun className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-base font-bold text-slate-100 num-tabular">{uvInfo.ratioText}</div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div className={`h-full rounded-full ${uvInfo.bgClass}`} style={{ width: `${uvInfo.progressPct}%` }} />
          </div>
          <div className={`text-[10px] font-semibold mt-1 ${uvInfo.colorClass}`}>{uvInfo.label}</div>
        </div>
      )}

      {/* 8. Sole & Luna */}
      {visibleCards.includes('sunMoon') && (
        <div className="p-3 bg-slate-900/70 border border-slate-800/90 rounded-2xl card-surface">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="font-medium">Sole &amp; Luna</span>
            <span className="text-xs" title={currentDay.moon.phaseName}>{currentDay.moon.phaseIcon}</span>
          </div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-100 num-tabular">
            <div className="flex items-center gap-1"><Sunrise className="w-3.5 h-3.5 text-amber-300" /><span>{currentDay.sunrise}</span></div>
            <div className="flex items-center gap-1"><Sunset className="w-3.5 h-3.5 text-orange-400" /><span>{currentDay.sunset}</span></div>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 num-tabular">
            <span>{currentDay.moon.phaseName}</span>
            <span className="text-slate-300 font-medium">{currentDay.moon.illuminationPct}% luce</span>
          </div>
        </div>
      )}

      {/* 9. Zero Termico (Opzionale) */}
      {visibleCards.includes('freezingLevel') && (
        <div className="p-3 bg-slate-900/70 border border-slate-800/90 rounded-2xl card-surface">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium">Zero Termico</span>
            <Mountain className="w-3.5 h-3.5 text-sky-400" />
          </div>
          <div className="text-base font-bold text-slate-100 num-tabular">
            {isToday ? data.current.freezingLevel : currentDay.freezingLevelMax} <span className="text-xs font-normal text-slate-400">m s.l.m.</span>
          </div>
          <div className="text-[10px] text-slate-400 mt-0.5 truncate">
            {isToday ? `Min: ${currentDay.freezingLevelMin} m` : `${currentDay.freezingLevelMin} - ${currentDay.freezingLevelMax} m`}
          </div>
        </div>
      )}
    </div>
  );
};
