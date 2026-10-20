import React, { useState } from 'react';
import { X, Palette, Sliders, LayoutGrid, RotateCcw, Scale } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { AppearanceSettingsTab } from './AppearanceSettingsTab';
import { DataSettingsTab } from './DataSettingsTab';
import { LayoutSettingsTab } from './LayoutSettingsTab';

export const SettingsDrawer: React.FC = () => {
  const { isSettingsOpen, setIsSettingsOpen, resetPreferences } = useAppStore();
  const [activeTab, setActiveTab] = useState<'appearance' | 'data' | 'layout'>('appearance');

  if (!isSettingsOpen) return null;

  const isLivePreview = activeTab === 'appearance';

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-all duration-300 ${
        isLivePreview ? 'bg-black/15 backdrop-blur-none' : 'bg-black/60 backdrop-blur-sm'
      }`}
    >
      <div
        style={{ backgroundColor: 'var(--bg-card-solid)' }}
        className={`w-full max-w-lg border-t sm:border border-slate-800 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col transition-all duration-300 ${
          isLivePreview ? 'max-h-[60vh]' : 'max-h-[85vh]'
        }`}
      >
        {/* Header */}
        <div
          style={{ backgroundColor: 'var(--bg-card-solid)' }}
          className="flex items-center justify-between px-4 py-3.5 border-b border-slate-800"
        >
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white tracking-tight">Personalizzazione</h3>
              <p className="text-[10px] text-slate-400">Modifica aspetto, calcoli e moduli</p>
            </div>
          </div>
          <button
            onClick={() => setIsSettingsOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            type="button"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div
          style={{ backgroundColor: 'var(--bg-sub)' }}
          className="grid grid-cols-3 gap-1 p-2 border-b border-slate-800/80 text-xs"
        >
          <button
            onClick={() => setActiveTab('appearance')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl font-medium transition-all ${
              activeTab === 'appearance'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            type="button"
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Aspetto</span>
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl font-medium transition-all ${
              activeTab === 'data'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            type="button"
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Dati &amp; Calcoli</span>
          </button>
          <button
            onClick={() => setActiveTab('layout')}
            className={`flex items-center justify-center gap-1.5 py-1.5 rounded-xl font-medium transition-all ${
              activeTab === 'layout'
                ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            type="button"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Card Visibili</span>
          </button>
        </div>

        {/* Body Content */}
        <div
          style={{ backgroundColor: 'var(--bg-card-solid)' }}
          className="flex-1 overflow-y-auto p-4 space-y-4"
        >
          {activeTab === 'appearance' && <AppearanceSettingsTab />}
          {activeTab === 'data' && <DataSettingsTab />}
          {activeTab === 'layout' && <LayoutSettingsTab />}
        </div>

        {/* Footer Actions */}
        <div
          style={{ backgroundColor: 'var(--bg-card-solid)' }}
          className="p-3 border-t border-slate-800 flex items-center justify-between gap-2"
        >
          <button
            onClick={resetPreferences}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition-colors px-2.5 py-1.5 rounded-lg hover:bg-slate-900"
            type="button"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Ripristina Default</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(false)}
            className="px-4 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs rounded-xl shadow transition-transform active:scale-95"
            type="button"
          >
            Salva &amp; Chiudi
          </button>
        </div>
      </div>
    </div>
  );
};
