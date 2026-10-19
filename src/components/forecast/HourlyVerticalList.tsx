import React, { useState } from 'react';
import { HourlyRow } from './HourlyRow';
import { Filter } from 'lucide-react';
import type { HourlyRowData } from '../../types/weather.types';

interface HourlyVerticalListProps {
  hourly: HourlyRowData[];
  isToday: boolean;
}

export const HourlyVerticalList: React.FC<HourlyVerticalListProps> = ({
  hourly,
  isToday,
}) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [onlyFromNow, setOnlyFromNow] = useState(false);

  const currentHourNum = new Date().getHours();

  const handleToggle = (index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  };

  const displayedRows = isToday && onlyFromNow
    ? hourly.filter((row) => {
        const h = parseInt(row.hour.split(':')[0], 10);
        return h >= currentHourNum;
      })
    : hourly;

  return (
    <div className="w-full px-3 py-2 space-y-2">
      {/* Header with filter toggle */}
      <div className="flex items-center justify-between px-1 text-xs text-slate-400">
        <span className="font-semibold text-slate-200 flex items-center gap-1.5">
          <span>Previsione Oraria</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-400 font-normal">
            {displayedRows.length} ore
          </span>
        </span>

        {isToday && (
          <button
            onClick={() => setOnlyFromNow((prev) => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full border text-[11px] font-medium transition-colors ${
              onlyFromNow
                ? 'bg-sky-500/20 border-sky-500/60 text-sky-300 font-semibold shadow-sm'
                : 'bg-slate-900/80 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>Da adesso</span>
          </button>
        )}
      </div>

      {/* Rows Grouped in Frosted Glass Container */}
      <div className="rounded-3xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md overflow-hidden shadow-xl divide-y divide-slate-800/50">
        {displayedRows.map((row, idx) => {
          const hourNum = parseInt(row.hour.split(':')[0], 10);
          const isCurrent = isToday && hourNum === currentHourNum;

          return (
            <HourlyRow
              key={row.time}
              row={row}
              isCurrentHour={isCurrent}
              isExpanded={expandedIndex === idx}
              onToggle={() => handleToggle(idx)}
            />
          );
        })}
      </div>
    </div>
  );
};
