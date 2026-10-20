import React, { useState } from 'react';
import { Clock } from 'lucide-react';
import type { HourlyRowData } from '../../types/weather.types';

interface HourScrubberProps {
  hourly: HourlyRowData[];
}

export const HourScrubber: React.FC<HourScrubberProps> = ({ hourly }) => {
  const [selectedHour, setSelectedHour] = useState<number>(12);

  const scrollToHour = (hourNum: number) => {
    setSelectedHour(hourNum);
    const element = document.getElementById(`hour-row-${hourNum}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const quickHours = [0, 6, 12, 18];

  return (
    <div className="bg-slate-900/80 border-y border-slate-800/80 px-4 py-2 backdrop-blur-md card-surface">
      <div className="flex items-center justify-between gap-3 mb-1.5">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
          <Clock className="w-3.5 h-3.5 text-sky-400" />
          <span>Salta all&apos;ora:</span>
          <span className="text-sky-300 font-bold ml-1 num-tabular">
            {selectedHour.toString().padStart(2, '0')}:00
          </span>
        </div>

        {/* Quick jump buttons */}
        <div className="flex items-center gap-1 num-tabular">
          {quickHours.map((h) => (
            <button
              key={h}
              onClick={() => scrollToHour(h)}
              className={`px-2 py-0.5 rounded-md text-[11px] font-medium border transition-colors ${
                selectedHour === h
                  ? 'bg-sky-500/20 border-sky-500/60 text-sky-300'
                  : 'bg-slate-800/80 border-slate-700/60 text-slate-400 hover:text-slate-200'
              }`}
              type="button"
            >
              {h.toString().padStart(2, '0')}
            </button>
          ))}
        </div>
      </div>

      {/* Slider with rain ticks */}
      <div className="relative flex items-center">
        {/* Rain indicators along the slider */}
        <div className="absolute inset-x-0 h-1 flex pointer-events-none px-1">
          {hourly.slice(0, 24).map((h) => (
            <div
              key={h.time}
              className={`flex-1 h-full mx-[0.5px] rounded-full ${
                h.precipitation > 0 ? 'bg-cyan-400/70' : 'transparent'
              }`}
            />
          ))}
        </div>

        <input
          type="range"
          min="0"
          max="23"
          step="1"
          value={selectedHour}
          onChange={(e) => scrollToHour(parseInt(e.target.value, 10))}
          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-400 focus:outline-none"
        />
      </div>

      <div className="flex justify-between text-[9px] text-slate-500 mt-1 px-0.5 num-tabular">
        <span>00:00</span>
        <span>06:00</span>
        <span>12:00</span>
        <span>18:00</span>
        <span>23:00</span>
      </div>
    </div>
  );
};
