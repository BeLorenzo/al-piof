import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { WindUnit } from '../../types/weather.types';

export const DataSettingsTab: React.FC = () => {
  const { preferences, updatePreferences } = useAppStore();

  const windUnits: { id: WindUnit; label: string }[] = [
    { id: 'kmh', label: 'km/h' },
    { id: 'ms', label: 'm/s' },
    { id: 'knots', label: 'Nodi (kn)' },
  ];

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Media Ensemble */}
      <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-white">Media Ensemble in Blend</div>
          <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
            Calcola la temperatura oraria e giornaliera come media di MeteoSwiss, ECMWF e ICON.
          </div>
        </div>
        <input
          type="checkbox"
          checked={preferences.useEnsembleAverageInBlend}
          onChange={(e) => updatePreferences({ useEnsembleAverageInBlend: e.target.checked })}
          className="w-4 h-4 accent-sky-500 cursor-pointer shrink-0 rounded"
        />
      </div>

      {/* Arrotondamento Temperature */}
      <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-white">Arrotonda Temperature</div>
          <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
            Mostra temperature arrotondate all&apos;intero (es. 18&deg;) anziché con un decimale.
          </div>
        </div>
        <input
          type="checkbox"
          checked={preferences.roundTemperatures}
          onChange={(e) => updatePreferences({ roundTemperatures: e.target.checked })}
          className="w-4 h-4 accent-sky-500 cursor-pointer shrink-0 rounded"
        />
      </div>

      {/* Unità Vento */}
      <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800">
        <div className="text-xs font-bold text-white mb-1">Unità di Misura Vento</div>
        <div className="grid grid-cols-3 gap-1.5 mt-2">
          {windUnits.map((u) => {
            const isSelected = preferences.windUnit === u.id;
            return (
              <button
                key={u.id}
                onClick={() => updatePreferences({ windUnit: u.id })}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                  isSelected
                    ? 'bg-sky-500/20 border-sky-400 text-sky-200'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                type="button"
              >
                {u.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Filtra Ore Passate */}
      <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-white">Filtro &quot;Da adesso&quot; predefinito</div>
          <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
            Nasconde automaticamente le ore già trascorse nella lista oraria di Oggi.
          </div>
        </div>
        <input
          type="checkbox"
          checked={preferences.defaultFilterFromNow}
          onChange={(e) => updatePreferences({ defaultFilterFromNow: e.target.checked })}
          className="w-4 h-4 accent-sky-500 cursor-pointer shrink-0 rounded"
        />
      </div>

      {/* Righe Compatte */}
      <div className="p-3 rounded-2xl bg-slate-950/50 border border-slate-800 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-bold text-white">Righe Orarie Ultra-Compatte</div>
          <div className="text-[11px] text-slate-400 leading-snug mt-0.5">
            Riduce il padding verticale della lista oraria per vedere più ore contemporaneamente.
          </div>
        </div>
        <input
          type="checkbox"
          checked={preferences.compactHourlyRows}
          onChange={(e) => updatePreferences({ compactHourlyRows: e.target.checked })}
          className="w-4 h-4 accent-sky-500 cursor-pointer shrink-0 rounded"
        />
      </div>
    </div>
  );
};
