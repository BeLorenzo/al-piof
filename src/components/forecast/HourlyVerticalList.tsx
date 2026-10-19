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
    <div className="w-full bg-slate-950 px-4 py-2">
      {/* Header with filter toggle */}
      <div className="flex items-center justify-between pb-2 pt-1 border-b border-slate-800 text-xs text-slate-400">
        <span className="font-semibold text-slate-300">
          Dettaglio Ora per Ora ({displayedRows.length} ore)
        </span>

        {isToday && (
          <button
            onClick={() => setOnlyFromNow((prev) => !prev)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-medium transition-colors ${
              onlyFromNow
                ? 'bg-sky-500/20 border-sky-500/60 text-sky-300'
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Filter className="w-3 h-3" />
            <span>Da adesso in poi</span>
          </button>
        )}
      </div>

      {/* Rows Container */}
      <div className="divide-y divide-slate-800/40">
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
