import React from 'react';
import { formatTemperature } from '../../utils/meteoMath';
import type { UserPreferences } from '../../types/weather.types';

export interface ChartPoint {
  index: number;
  x: number;
  y: number;
  temp: number;
  hour: string;
  hourNum: number;
  rain: number;
  windSpeed: number;
}

interface HourlyChartSvgProps {
  points: ChartPoint[];
  pathD: string;
  areaD: string;
  currentHourPoint: ChartPoint | null;
  activeHourIndex: number | null;
  setActiveHourIndex: (index: number) => void;
  maxRain: number;
  preferences: UserPreferences;
  svgWidth: number;
  svgHeight: number;
  paddingX: number;
  tempTop: number;
  tempBottom: number;
  rainBaseline: number;
  maxBarHeight: number;
  scrollContainerRef: React.RefObject<HTMLDivElement>;
}

export const HourlyChartSvg: React.FC<HourlyChartSvgProps> = ({
  points,
  pathD,
  areaD,
  currentHourPoint,
  activeHourIndex,
  setActiveHourIndex,
  maxRain,
  preferences,
  svgWidth,
  svgHeight,
  paddingX,
  tempTop,
  tempBottom,
  rainBaseline,
  maxBarHeight,
  scrollContainerRef,
}) => {
  return (
    <div
      ref={scrollContainerRef}
      className="overflow-x-auto no-scrollbar bg-slate-900/60 border border-slate-800/80 rounded-3xl p-2 select-none card-surface"
    >
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-[840px] h-[260px] overflow-visible">
        <defs>
          <linearGradient id="tempGradient2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Separatore corsia pioggia */}
        <line
          x1={paddingX}
          y1={tempBottom + 12}
          x2={svgWidth - paddingX}
          y2={tempBottom + 12}
          stroke="#1e293b"
          strokeDasharray="4 4"
          strokeWidth="1"
        />

        {/* Area sfumata temperatura */}
        <path d={areaD} fill="url(#tempGradient2)" />

        {/* Marker ora attuale */}
        {currentHourPoint && (
          <g>
            <line
              x1={currentHourPoint.x}
              y1={tempTop - 10}
              x2={currentHourPoint.x}
              y2={svgHeight - 22}
              stroke="#38bdf8"
              strokeDasharray="3 3"
              strokeWidth="1.5"
              opacity="0.8"
            />
            <rect x={currentHourPoint.x - 14} y={tempTop - 22} width={28} height={14} rx={4} className="fill-sky-500" />
            <text x={currentHourPoint.x} y={tempTop - 12} textAnchor="middle" className="fill-slate-950 text-[9px] font-black">
              ORA
            </text>
          </g>
        )}

        {/* Linea temperatura */}
        <path d={pathD} fill="none" stroke="#f59e0b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

        {/* Barre pioggia */}
        {points.map((pt) => {
          const barHeight = pt.rain > 0 ? Math.max(4, (pt.rain / maxRain) * maxBarHeight) : 0;
          const barY = rainBaseline - barHeight;
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
                  {pt.rain >= 0.5 && (
                    <text x={pt.x} y={barY - 3} textAnchor="middle" className="fill-cyan-300 text-[9px] font-bold num-tabular">
                      {pt.rain}
                    </text>
                  )}
                </>
              )}
            </g>
          );
        })}

        {/* Punti e label temperatura */}
        {points.map((pt, i) => {
          const showLabel = i % 3 === 0 || i === points.length - 1;
          const isActive = activeHourIndex === i;
          return (
            <g key={`pt-${pt.hour}`} className="cursor-pointer" onClick={() => setActiveHourIndex(i)}>
              <rect x={pt.x - 15} y={0} width={30} height={svgHeight} fill="transparent" />
              <circle
                cx={pt.x}
                cy={pt.y}
                r={isActive ? 5 : 3}
                className={isActive ? 'fill-white stroke-sky-400' : 'fill-slate-950 stroke-amber-400'}
                strokeWidth="2"
              />
              {showLabel && (
                <text x={pt.x} y={pt.y - 7} textAnchor="middle" className="fill-slate-200 text-[10px] font-bold num-tabular">
                  {formatTemperature(pt.temp, preferences.roundTemperatures)}
                </text>
              )}
              {showLabel && (
                <text x={pt.x} y={svgHeight - 8} textAnchor="middle" className="fill-slate-400 text-[10px] num-tabular">
                  {pt.hour}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};
