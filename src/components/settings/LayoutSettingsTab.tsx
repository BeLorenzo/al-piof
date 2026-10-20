import React from 'react';
import {
  Mountain,
  Wind,
  Gauge,
  Droplets,
  Sun,
  Moon,
  CloudRain,
  History,
  FileText,
  Scale,
  Eye,
  Cloud,
} from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import type { BentoCardId } from '../../types/weather.types';

export const LayoutSettingsTab: React.FC = () => {
  const { preferences, updatePreferences } = useAppStore();

  const bentoCardDefinitions: { id: BentoCardId; label: string; icon: React.ElementType }[] = [
    { id: 'visibility', label: 'Visibilità & Nebbia', icon: Eye },
    { id: 'cloudSun', label: 'Copertura Nubi', icon: Cloud },
    { id: 'airQuality', label: 'Qualità Aria & Pollini', icon: Wind },
    { id: 'pressureDew', label: 'Pressione & Rugiada', icon: Gauge },
    { id: 'wind', label: 'Vento & Raffiche', icon: Wind },
    { id: 'humidity', label: 'Umidità Relativa', icon: Droplets },
    { id: 'uv', label: 'Indice UV Max', icon: Sun },
    { id: 'sunMoon', label: 'Sole & Luna', icon: Moon },
    { id: 'freezingLevel', label: 'Zero Termico (Alpino)', icon: Mountain },
  ];

  const toggleBentoCard = (cardId: BentoCardId) => {
    const current = preferences.visibleBentoCards;
    if (current.includes(cardId)) {
      if (current.length <= 1) return; // Non lasciare vuoto
      updatePreferences({ visibleBentoCards: current.filter((c) => c !== cardId) });
    } else {
      updatePreferences({ visibleBentoCards: [...current, cardId] });
    }
  };

  return (
    <div className="space-y-4 animate-fade-in text-xs">
      {/* Bento Cards Visibility */}
      <div>
        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
          Card della Bento Grid (Hero)
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {bentoCardDefinitions.map((card) => {
            const isVisible = preferences.visibleBentoCards.includes(card.id);
            const CardIcon = card.icon;
            return (
              <button
                key={card.id}
                onClick={() => toggleBentoCard(card.id)}
                className={`p-2.5 rounded-xl border flex items-center justify-between transition-all ${
                  isVisible
                    ? 'bg-slate-950/70 border-slate-700/80 text-white'
                    : 'bg-slate-950/30 border-slate-900 text-slate-500 opacity-60'
                }`}
                type="button"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-1.5 rounded-lg ${
                      isVisible ? 'bg-sky-500/20 text-sky-400' : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    <CardIcon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-semibold">{card.label}</span>
                </div>
                <div
                  className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                    isVisible
                      ? 'bg-sky-500 border-sky-400'
                      : 'border-slate-700 bg-transparent'
                  }`}
                >
                  {isVisible && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Home Sections Toggle */}
      <div>
        <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block mb-2">
          Sezioni Principali Pagina
        </label>
        <div className="space-y-1.5">
          {/* Bollettino Testuale */}
          <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-400" />
              <span className="text-xs font-medium text-slate-200">Bollettino Smart Giornaliero</span>
            </div>
            <input
              type="checkbox"
              checked={preferences.showTextSummary}
              onChange={(e) => updatePreferences({ showTextSummary: e.target.checked })}
              className="w-4 h-4 accent-sky-500 cursor-pointer rounded"
            />
          </div>

          {/* Confronto Modelli */}
          <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-medium text-slate-200">Scheda Comparazione Modelli</span>
            </div>
            <input
              type="checkbox"
              checked={preferences.showModelComparison}
              onChange={(e) => updatePreferences({ showModelComparison: e.target.checked })}
              className="w-4 h-4 accent-sky-500 cursor-pointer rounded"
            />
          </div>

          {/* Almanacco Storico */}
          <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium text-slate-200">Almanacco Storico (5 anni)</span>
            </div>
            <input
              type="checkbox"
              checked={preferences.showHistoricalAlmanac}
              onChange={(e) => updatePreferences({ showHistoricalAlmanac: e.target.checked })}
              className="w-4 h-4 accent-sky-500 cursor-pointer rounded"
            />
          </div>

          {/* Anteprima Radar in fondo */}
          <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CloudRain className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-medium text-slate-200">Anteprima Radar a fondo pagina</span>
            </div>
            <input
              type="checkbox"
              checked={preferences.showBottomRadarPreview}
              onChange={(e) => updatePreferences({ showBottomRadarPreview: e.target.checked })}
              className="w-4 h-4 accent-sky-500 cursor-pointer rounded"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
