import React, { useState, useEffect, useRef } from 'react';
import { Droplets, Thermometer, Wind } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { formatTemperature, formatWindSpeed } from '../../utils/meteoMath';
import { HourlyChartSvg } from './HourlyChartSvg';
import type { HourlyRowData } from '../../types/weather.types';

interface HourlyChartProps {
  hourly: HourlyRowData[];
  isToday?: boolean;
}

export const HourlyChart: React.FC<HourlyChartProps> = ({ hourly, isToday = false }) => {
  const preferences = useAppStore((state) => state.preferences);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const currentHourNum = new Date().getHours();
  const [activeHourIndex, setActiveHourIndex] = useState<number | null>(
    isToday ? Math.min(currentHourNum, hourly.length - 1) : null
  );

  const svgWidth = 840;
  const svgHeight = 260;
  const paddingX = 35;
  const tempTop = 25;
  const tempBottom = 155;
  const tempPlotHeight = tempBottom - tempTop;
  const rainBaseline = 225;
  const maxBarHeight = 36;

  // Auto-scroll to current hour on mount if today
  useEffect(() => {
    if (isToday && scrollContainerRef.current) {
      const currentX =
        paddingX + (currentHourNum / Math.max(1, hourly.length - 1)) * (svgWidth - paddingX * 2);
      scrollContainerRef.current.scrollTo({
        left: Math.max(0, currentX - 160),
        behavior: 'smooth',
      });
    }
  }, [isToday, currentHourNum, hourly.length]);

  if (!hourly || hourly.length === 0) return null;

  const temps = hourly.map((h) => h.temperature);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = Math.max(1, maxTemp - minTemp);
  const maxRain = Math.max(1, ...hourly.map((h) => h.precipitation));

  // Generate points for the temperature line
  const points = hourly.map((h, i) => {
    const x = paddingX + (i / (hourly.length - 1)) * (svgWidth - paddingX * 2);
    const normalizedTemp = (h.temperature - minTemp) / tempRange;
    const y = tempBottom - normalizedTemp * tempPlotHeight;
    return {
      index: i,
      x,
      y,
      temp: h.temperature,
      hour: h.hour,
      hourNum: parseInt(h.hour.split(':')[0], 10),
      rain: h.precipitation,
      windSpeed: h.windSpeed,
    };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${tempBottom} L ${points[0].x} ${tempBottom} Z`;
  const activePoint = activeHourIndex !== null ? points[activeHourIndex] : null;
  const currentHourPoint = isToday
    ? points.find((p) => p.hourNum === currentHourNum) || null
    : null;

  return (
    <div className="w-full px-4 py-3 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
          <Thermometer className="w-4 h-4 text-amber-400" />
          <span>Andamento Orario (Temp &amp; Pioggia)</span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span>Temp</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block" />
            <span>Pioggia</span>
          </span>
        </div>
      </div>

      {/* Active inspector banner if user taps a point */}
      {activePoint && (
        <div className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between text-xs text-slate-300 animate-fade-in card-surface num-tabular">
          <span className="font-bold text-sky-400">Ore {activePoint.hour}:</span>
          <span className="text-white font-bold">
            {formatTemperature(activePoint.temp, preferences.roundTemperatures)}
          </span>
          <span className="text-cyan-300">
            Pioggia: {activePoint.rain > 0 ? `${activePoint.rain} mm` : '0 mm'}
          </span>
          <span className="text-slate-400 flex items-center gap-1">
            <Wind className="w-3 h-3 text-slate-400" />
            {formatWindSpeed(activePoint.windSpeed, preferences.windUnit)}
          </span>
        </div>
      )}

      {/* Horizontally scrollable SVG chart container */}
      <HourlyChartSvg
        points={points}
        pathD={pathD}
        areaD={areaD}
        currentHourPoint={currentHourPoint}
        activeHourIndex={activeHourIndex}
        setActiveHourIndex={setActiveHourIndex}
        maxRain={maxRain}
        preferences={preferences}
        svgWidth={svgWidth}
        svgHeight={svgHeight}
        paddingX={paddingX}
        tempTop={tempTop}
        tempBottom={tempBottom}
        rainBaseline={rainBaseline}
        maxBarHeight={maxBarHeight}
        scrollContainerRef={scrollContainerRef}
      />

      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1 num-tabular">
        <span>Minima: <strong className="text-slate-300">{formatTemperature(minTemp, preferences.roundTemperatures)}</strong></span>
        <span>Massima: <strong className="text-slate-300">{formatTemperature(maxTemp, preferences.roundTemperatures)}</strong></span>
        <span className="text-slate-400 flex items-center gap-1">
          <Droplets className="w-3 h-3 text-cyan-400" />
          <span>Tocca un punto per dettagli</span>
        </span>
      </div>
    </div>
  );
};
