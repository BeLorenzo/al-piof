import React, { useState } from 'react';
import { Droplets, Thermometer, Wind } from 'lucide-react';
import type { HourlyRowData } from '../../types/weather.types';

interface HourlyChartProps {
  hourly: HourlyRowData[];
}

export const HourlyChart: React.FC<HourlyChartProps> = ({ hourly }) => {
  const [activeHourIndex, setActiveHourIndex] = useState<number | null>(null);

  if (!hourly || hourly.length === 0) return null;

  const temps = hourly.map((h) => h.temperature);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = Math.max(1, maxTemp - minTemp);

  const maxRain = Math.max(1, ...hourly.map((h) => h.precipitation));

  // SVG dimensions: separate Upper Temperature zone from Lower Rain zone
  const svgWidth = 840;
  const svgHeight = 260;
  const paddingX = 35;

  // Temperature lane: y from 25 to 155 (height 130px)
  const tempTop = 25;
  const tempBottom = 155;
  const tempPlotHeight = tempBottom - tempTop;

  // Rain lane: baseline at y = 225, max bar height 38px (y from 187 to 225)
  const rainBaseline = 225;
  const maxBarHeight = 36;

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
      rain: h.precipitation,
      windSpeed: h.windSpeed,
    };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${tempBottom} L ${points[0].x} ${tempBottom} Z`;

  const activePoint = activeHourIndex !== null ? points[activeHourIndex] : null;

  return (
    <div className="w-full bg-slate-950 px-4 py-3 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
          <Thermometer className="w-4 h-4 text-amber-400" />
          <span>Andamento Orario Separato (Temp &amp; Pioggia)</span>
        </div>
        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span>Temp (°C)</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm bg-cyan-500 inline-block" />
            <span>Pioggia (mm)</span>
          </span>
        </div>
      </div>

      {/* Active inspector banner if user taps a point */}
      {activePoint && (
        <div className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs text-slate-300 animate-fade-in">
          <span className="font-bold text-sky-400">Ore {activePoint.hour}:</span>
          <span className="text-white font-semibold">{activePoint.temp}°C</span>
          <span className="text-cyan-300">
            Pioggia: {activePoint.rain > 0 ? `${activePoint.rain} mm` : '0 mm'}
          </span>
          <span className="text-slate-400 flex items-center gap-1">
            <Wind className="w-3 h-3 text-slate-400" />
            {activePoint.windSpeed} km/h
          </span>
        </div>
      )}

      {/* Horizontally scrollable SVG chart container */}
      <div className="overflow-x-auto no-scrollbar bg-slate-900/60 border border-slate-800/80 rounded-2xl p-2 select-none">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-[840px] h-[260px] overflow-visible"
        >
          <defs>
            <linearGradient id="tempGradient2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Separator line between temperature area and rain lane */}
          <line
            x1={paddingX}
            y1={tempBottom + 12}
            x2={svgWidth - paddingX}
            y2={tempBottom + 12}
            stroke="#1e293b"
            strokeDasharray="4 4"
            strokeWidth="1"
          />

          {/* Area fill under temperature line */}
          <path d={areaD} fill="url(#tempGradient2)" />

          {/* Temperature Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Rain Bars & Labels in dedicated bottom lane */}
          {points.map((pt) => {
            const barHeight = pt.rain > 0 ? Math.max(4, (pt.rain / maxRain) * maxBarHeight) : 0;
            const barY = rainBaseline - barHeight;
            const showRainText = pt.rain >= 0.5;

            return (
              <g key={`rain-${pt.hour}`}>
                {pt.rain > 0 && (
                  <>
                    <rect
                      x={pt.x - 6}
                      y={barY}
                      width={12}
                      height={barHeight}
                      rx={2}
                      className={pt.rain >= 3 ? 'fill-blue-500' : 'fill-cyan-400/80'}
                    />
                    {showRainText && (
                      <text
                        x={pt.x}
                        y={barY - 3}
                        textAnchor="middle"
                        className="fill-cyan-300 text-[9px] font-bold"
                      >
                        {pt.rain}
                      </text>
                    )}
                  </>
                )}
              </g>
            );
          })}

          {/* Temperature Dots & Spaced Labels */}
          {points.map((pt, i) => {
            // Space labels every 3 hours (00, 03, 06, 09, 12, 15, 18, 21, 23)
            const showLabel = i % 3 === 0 || i === points.length - 1;
            const isActive = activeHourIndex === i;

            return (
              <g
                key={`pt-${pt.hour}`}
                className="cursor-pointer"
                onClick={() => setActiveHourIndex(i)}
              >
                {/* Touch hit area */}
                <rect
                  x={pt.x - 15}
                  y={0}
                  width={30}
                  height={svgHeight}
                  fill="transparent"
                />

                {/* Temp dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isActive ? 5 : 3}
                  className={
                    isActive
                      ? 'fill-white stroke-sky-400'
                      : 'fill-slate-950 stroke-amber-400'
                  }
                  strokeWidth="2"
                />

                {/* Temp Label above dot (strictly above y - 6) */}
                {showLabel && (
                  <text
                    x={pt.x}
                    y={pt.y - 7}
                    textAnchor="middle"
                    className="fill-slate-200 text-[10px] font-bold"
                  >
                    {pt.temp}°
                  </text>
                )}

                {/* Hour label below rain lane */}
                {showLabel && (
                  <text
                    x={pt.x}
                    y={svgHeight - 8}
                    textAnchor="middle"
                    className="fill-slate-400 text-[10px]"
                  >
                    {pt.hour}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
        <span>Minima: <strong className="text-slate-300">{minTemp}°</strong></span>
        <span>Massima: <strong className="text-slate-300">{maxTemp}°</strong></span>
        <span className="text-slate-400 flex items-center gap-1">
          <Droplets className="w-3 h-3 text-cyan-400" />
          <span>Tocca qualsiasi punto per dettagli ora per ora</span>
        </span>
      </div>
    </div>
  );
};
