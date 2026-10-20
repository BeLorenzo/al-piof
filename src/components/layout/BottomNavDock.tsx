import React from 'react';
import { ListFilter, LineChart, Radar, SlidersHorizontal } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';

export const BottomNavDock: React.FC = () => {
  const { viewMode, setViewMode, isSettingsOpen, setIsSettingsOpen } = useAppStore();

  const handleNavClick = (mode: 'hourly' | 'chart' | 'radar') => {
    setViewMode(mode);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 px-2 py-1.5 rounded-full bg-slate-900/90 backdrop-blur-xl border border-slate-700/80 shadow-2xl flex items-center gap-1.5"
      style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <button
        onClick={() => handleNavClick('hourly')}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
          viewMode === 'hourly'
            ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30 font-bold scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        type="button"
      >
        <ListFilter className="w-3.5 h-3.5" />
        <span>Oraria</span>
      </button>

      <button
        onClick={() => handleNavClick('chart')}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
          viewMode === 'chart'
            ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30 font-bold scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        type="button"
      >
        <LineChart className="w-3.5 h-3.5" />
        <span>Grafico</span>
      </button>

      <button
        onClick={() => handleNavClick('radar')}
        className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
          viewMode === 'radar'
            ? 'bg-sky-500 text-slate-950 shadow-md shadow-sky-500/30 font-bold scale-105'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        type="button"
      >
        <Radar className="w-3.5 h-3.5" />
        <span>Mappa</span>
      </button>

      <div className="w-px h-4 bg-slate-700/80 mx-0.5" />

      <button
        onClick={() => setIsSettingsOpen(true)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
          isSettingsOpen
            ? 'bg-sky-500 text-slate-950 shadow-md font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
        type="button"
        title="Personalizza interfaccia e parametri"
      >
        <SlidersHorizontal className="w-3.5 h-3.5" />
        <span>Stile</span>
      </button>
    </nav>
  );
};
