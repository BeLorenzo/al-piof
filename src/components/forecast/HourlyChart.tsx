import React from 'react';
import { Droplets, Thermometer } from 'lucide-react';
import type { HourlyRowData } from '../../types/weather.types';

interface HourlyChartProps {
  hourly: HourlyRowData[];
}

export const HourlyChart: React.FC<HourlyChartProps> = ({ hourly }) => {
  if (!hourly || hourly.length === 0) return null;

  const temps = hourly.map((h) => h.temperature);
  const minTemp = Math.min(...temps);
  const maxTemp = Math.max(...temps);
  const tempRange = Math.max(1, maxTemp - minTemp);

  const maxRain = Math.max(0.1, ...hourly.map((h) => h.precipitation));

  // SVG dimensions
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 30;
  const paddingY = 40;
  const plotWidth = svgWidth - paddingX * 2;
  const plotHeight = svgHeight - paddingY * 2;

  // Generate points for the temperature line
  const points = hourly.map((h, i) => {
    const x = paddingX + (i / (hourly.length - 1)) * plotWidth;
    const y =
      svgHeight -
      paddingY -
      ((h.temperature - minTemp) / tempRange) * plotHeight;
    return { x, y, temp: h.temperature, hour: h.hour, rain: h.precipitation };
  });

  const pathD = points.reduce((acc, pt, i) => {
    return i === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
  }, '');

  const areaD = `${pathD} L ${points[points.length - 1].x} ${
    svgHeight - paddingY
  } L ${points[0].x} ${svgHeight - paddingY} Z`;

  return (
    <div className="w-full bg-slate-950 px-4 py-3">
      <div className="flex items-center justify-between mb-3 text-xs">
        <div className="flex items-center gap-1.5 text-slate-300 font-semibold">
          <Thermometer className="w-4 h-4 text-amber-400" />
          <span>Andamento Temperatura &amp; Pioggia</span>
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

      {/* Horizontally scrollable SVG chart container */}
      <div className="overflow-x-auto no-scrollbar bg-slate-900/60 border border-slate-800/80 rounded-2xl p-2">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-[800px] h-[220px] overflow-visible"
        >
          <defs>
            <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Rain Bars at the bottom */}
          {points.map((pt) => {
            const barHeight = (pt.rain / maxRain) * 45;
            const barY = svgHeight - paddingY - barHeight;
            return (
              <g key={`rain-${pt.hour}`}>
                {pt.rain > 0 && (
                  <>
                    <rect
                      x={pt.x - 7}
                      y={barY}
                      width={14}
                      height={barHeight}
                      rx={2}
                      className="fill-cyan-500/60"
                    />
                    <text
                      x={pt.x}
                      y={barY - 3}
                      textAnchor="middle"
                      className="fill-cyan-300 text-[9px] font-bold"
                    >
                      {pt.rain}
                    </text>
                  </>
                )}
              </g>
            );
          })}

          {/* Area fill under temperature line */}
          <path d={areaD} fill="url(#tempGradient)" />

          {/* Temperature Line */}
          <path
            d={pathD}
            fill="none"
            stroke="#f59e0b"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Points, Labels and Hours */}
          {points.map((pt, i) => {
            const showLabel = i % 2 === 0;
            return (
              <g key={`pt-${pt.hour}`}>
                {/* Temp dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r="3.5"
                  className="fill-slate-950 stroke-amber-400"
                  strokeWidth="2"
                />

                {/* Temp Label above dot */}
                {showLabel && (
                  <text
                    x={pt.x}
                    y={pt.y - 8}
                    textAnchor="middle"
                    className="fill-slate-200 text-[11px] font-bold"
                  >
                    {pt.temp}°
                  </text>
                )}

                {/* Hour label below baseline */}
                {showLabel && (
                  <text
                    x={pt.x}
                    y={svgHeight - 12}
                    textAnchor="middle"
                    className="fill-slate-500 text-[10px]"
                  >
                    {pt.hour}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 px-1">
        <span>Minima: <strong className="text-slate-300">{minTemp}°</strong></span>
        <span>Massima: <strong className="text-slate-300">{maxTemp}°</strong></span>
        <span className="flex items-center gap-1">
          <Droplets className="w-3 h-3 text-cyan-400" />
          <span>Scorri orizzontalmente per vedere tutte le 24 ore &rarr;</span>
        </span>
      </div>
    </div>
  );
};
