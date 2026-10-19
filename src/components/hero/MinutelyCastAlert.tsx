import React from 'react';
import { CloudRain, AlertCircle } from 'lucide-react';
import type { Minutely15Slot } from '../../types/weather.types';

interface MinutelyCastAlertProps {
  slots: Minutely15Slot[];
}

export const MinutelyCastAlert: React.FC<MinutelyCastAlertProps> = ({ slots }) => {
  if (!slots || slots.length === 0) return null;

  // Filter slots with precipitation
  const rainySlots = slots.filter((s) => s.precipitation > 0);
  if (rainySlots.length === 0) return null;

  const firstRainSlot = rainySlots[0];
  const maxRain = Math.max(...slots.map((s) => s.precipitation));

  return (
    <div className="mx-4 my-2.5 p-3.5 bg-gradient-to-r from-sky-950/70 via-blue-950/60 to-slate-900/80 border border-sky-500/40 rounded-2xl shadow-lg shadow-sky-950/30">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-500/20 text-sky-300">
            <CloudRain className="w-4 h-4 animate-bounce" />
          </div>
          <div>
            <div className="text-xs font-bold text-sky-200">
              Nowcast 15-min: Pioggia in arrivo
            </div>
            <div className="text-[11px] text-sky-300/80">
              Inizio previsto alle ore <span className="font-semibold text-white">{firstRainSlot.timeLabel}</span> (picco {maxRain} mm)
            </div>
          </div>
        </div>
        <AlertCircle className="w-4 h-4 text-sky-400 shrink-0" />
      </div>

      {/* 8 mini-bars representing 15-min intervals over the next 2 hours */}
      <div className="grid grid-cols-8 gap-1 pt-1.5 border-t border-sky-800/40">
        {slots.slice(0, 8).map((slot) => {
          const isRain = slot.precipitation > 0;
          return (
            <div key={slot.time} className="flex flex-col items-center gap-1">
              <div className="w-full h-8 bg-slate-900/80 rounded-md overflow-hidden flex flex-col justify-end p-0.5">
                <div
                  className={`w-full rounded-sm transition-all ${
                    isRain
                      ? slot.precipitation > 2
                        ? 'bg-blue-500'
                        : 'bg-cyan-400'
                      : 'bg-slate-800'
                  }`}
                  style={{
                    height: `${Math.min(100, Math.max(15, slot.precipitation * 30))}%`,
                  }}
                />
              </div>
              <span className="text-[9px] text-slate-400 leading-none">
                {slot.timeLabel}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
